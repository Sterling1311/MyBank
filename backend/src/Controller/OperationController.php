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
    public function index(Request $request, OperationRepository $repo): JsonResponse
    {
        $month = $request->query->get('month'); // format: 2025-07

        if ($month) {
            [$year, $m] = explode('-', $month);
            $start = new \DateTime("$year-$m-01");
            $end = (clone $start)->modify('last day of this month');

            $operations = $repo->createQueryBuilder('o')
                ->where('o.user = :user')
                ->andWhere('o.date >= :start')
                ->andWhere('o.date <= :end')
                ->setParameter('user', $this->getUser())
                ->setParameter('start', $start)
                ->setParameter('end', $end)
                ->orderBy('o.date', 'DESC')
                ->getQuery()
                ->getResult();
        } else {
            $operations = $repo->findBy(
                ['user' => $this->getUser()],
                ['date' => 'DESC']
            );
        }

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

    #[Route('/summary', name: 'operation_summary', methods: ['GET'])]
    public function summary(OperationRepository $repo): JsonResponse
    {
        $operations = $repo->findBy(['user' => $this->getUser()]);

        $summary = [];
        foreach ($operations as $op) {
            $key = $op->getDate()->format('Y-m');
            if (!isset($summary[$key])) {
                $summary[$key] = ['month' => $key, 'income' => 0, 'expense' => 0, 'balance' => 0];
            }
            $amount = (float) $op->getAmount();
            if ($amount >= 0) {
                $summary[$key]['income'] += $amount;
            } else {
                $summary[$key]['expense'] += abs($amount);
            }
            $summary[$key]['balance'] += $amount;
        }

        ksort($summary);

        return $this->json(array_values($summary));
    }

    #[Route('', name: 'operation_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['label']) || !isset($data['amount']) || empty($data['date']) || empty($data['category_id'])) {
            return $this->json(['error' => 'Missing required fields'], 400);
        }

        $category = $categoryRepo->find($data['category_id']);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        $operation = new Operation();
        $operation->setLabel($data['label']);
        $operation->setAmount((string) $data['amount']);
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

    #[Route('/{id}', name: 'operation_update', methods: ['PUT'])]
    public function update(
        int $id,
        Request $request,
        OperationRepository $repo,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo
    ): JsonResponse {
        $operation = $repo->find($id);

        if (!$operation || $operation->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Operation not found'], 404);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['label'])) $operation->setLabel($data['label']);
        if (isset($data['amount'])) $operation->setAmount((string) $data['amount']);
        if (isset($data['date'])) $operation->setDate(new \DateTime($data['date']));
        if (isset($data['category_id'])) {
            $category = $categoryRepo->find($data['category_id']);
            if ($category) $operation->setCategory($category);
        }

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

        return $this->json(['message' => 'Operation deleted']);
    }
}