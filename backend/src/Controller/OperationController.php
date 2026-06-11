<?php

namespace App\Controller;

use App\Entity\Operation;
use App\Repository\CategoryRepository;
use App\Repository\OperationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/operations')]
class OperationController extends AbstractController
{
    #[Route('', name: 'operation_list', methods: ['GET'])]
    public function index(OperationRepository $repo): JsonResponse
    {
        $operations = $repo->findBy(['user' => $this->getUser()]);
        $data = array_map(fn($o) => [
            'id'         => $o->getId(),
            'label'      => $o->getLabel(),
            'amount'     => $o->getAmount(),
            'date'       => $o->getDate()->format('Y-m-d'),
            'category'   => [
                'id'   => $o->getCategory()->getId(),
                'name' => $o->getCategory()->getName(),
            ],
            'created_at' => $o->getCreatedAt()->format('Y-m-d H:i:s'),
        ], $operations);

        return $this->json($data);
    }

    #[Route('', name: 'operation_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['label']) || !isset($data['amount']) || empty($data['date']) || empty($data['category_id'])) {
            return $this->json(['error' => 'label, amount, date and category_id are required'], 400);
        }

        $category = $categoryRepo->find($data['category_id']);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        $operation = new Operation();
        $operation->setLabel($data['label']);
        $operation->setAmount($data['amount']);
        $operation->setDate(new \DateTime($data['date']));
        $operation->setCategory($category);
        $operation->setUser($this->getUser());
        $operation->setCreatedAt(new \DateTime());

        $em->persist($operation);
        $em->flush();

        return $this->json([
            'id'       => $operation->getId(),
            'label'    => $operation->getLabel(),
            'amount'   => $operation->getAmount(),
            'date'     => $operation->getDate()->format('Y-m-d'),
            'category' => [
                'id'   => $operation->getCategory()->getId(),
                'name' => $operation->getCategory()->getName(),
            ],
        ], 201);
    }

    #[Route('/{id}', name: 'operation_show', methods: ['GET'])]
    public function show(int $id, OperationRepository $repo): JsonResponse
    {
        $operation = $repo->find($id);

        if (!$operation || $operation->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Operation not found'], 404);
        }

        return $this->json([
            'id'         => $operation->getId(),
            'label'      => $operation->getLabel(),
            'amount'     => $operation->getAmount(),
            'date'       => $operation->getDate()->format('Y-m-d'),
            'category'   => [
                'id'   => $operation->getCategory()->getId(),
                'name' => $operation->getCategory()->getName(),
            ],
            'created_at' => $operation->getCreatedAt()->format('Y-m-d H:i:s'),
        ]);
    }

    #[Route('/{id}', name: 'operation_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        OperationRepository $repo,
        CategoryRepository $categoryRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $operation = $repo->find($id);

        if (!$operation || $operation->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Operation not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (!empty($data['label']))       $operation->setLabel($data['label']);
        if (isset($data['amount']))       $operation->setAmount($data['amount']);
        if (!empty($data['date']))        $operation->setDate(new \DateTime($data['date']));
        if (!empty($data['category_id'])) {
            $category = $categoryRepo->find($data['category_id']);
            if (!$category) {
                return $this->json(['error' => 'Category not found'], 404);
            }
            $operation->setCategory($category);
        }
        $operation->setUpdatedAt(new \DateTime());

        $em->flush();

        return $this->json([
            'id'       => $operation->getId(),
            'label'    => $operation->getLabel(),
            'amount'   => $operation->getAmount(),
            'date'     => $operation->getDate()->format('Y-m-d'),
            'category' => [
                'id'   => $operation->getCategory()->getId(),
                'name' => $operation->getCategory()->getName(),
            ],
        ]);
    }

    #[Route('/{id}', name: 'operation_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        OperationRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $operation = $repo->find($id);

        if (!$operation || $operation->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Operation not found'], 404);
        }

        $em->remove($operation);
        $em->flush();

        return $this->json(['message' => 'Operation deleted'], 200);
    }
}