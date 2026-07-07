<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/categories')]
class CategoryController extends AbstractController
{
    #[Route('', name: 'category_list', methods: ['GET'])]
public function index(CategoryRepository $repo): JsonResponse
{
    $categories = $repo->findBy([], ['name' => 'ASC']);
    $data = array_map(fn($c) => [
        'id'   => $c->getId(),
        'name' => $c->getName(),
        'type' => $c->getType(),
    ], $categories);

    return $this->json($data);
}

    #[Route('', name: 'category_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $repo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['name'])) {
            return $this->json(['error' => 'Name is required'], 400);
        }

        $existing = $repo->findOneBy(['name' => $data['name']]);
        if ($existing) {
            return $this->json(['error' => 'Category already exists'], 409);
        }

        $category = new Category();
        $category->setName($data['name']);
        $category->setType($data['type'] ?? null);
        $category->setCreatedAt(new \DateTime());

        $em->persist($category);
        $em->flush();

        return $this->json([
            'id'   => $category->getId(),
            'name' => $category->getName(),
            'type' => $category->getType(),
        ], 201);
    }

    #[Route('/suggestions', name: 'category_suggestions', methods: ['GET'])]
    public function suggestions(): JsonResponse
    {
        return $this->json([
            'income' => [
                ['name' => 'Travail', 'type' => 'income'],
                ['name' => 'Aides',   'type' => 'income'],
                ['name' => 'Autres',  'type' => 'income'],
            ],
            'expense' => [
                ['name' => 'Alimentation', 'type' => 'expense'],
                ['name' => 'Transport',    'type' => 'expense'],
                ['name' => 'Logement',     'type' => 'expense'],
                ['name' => 'Santé',        'type' => 'expense'],
                ['name' => 'Loisirs',      'type' => 'expense'],
                ['name' => 'Shopping',     'type' => 'expense'],
                ['name' => 'Abonnements',  'type' => 'expense'],
                ['name' => 'Divers',       'type' => 'expense'],
            ],
        ]);
    }

    #[Route('/{id}', name: 'category_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        CategoryRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $category = $repo->find($id);

        if (!$category) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        $em->remove($category);
        $em->flush();

        return $this->json(['message' => 'Category deleted'], 200);
    }
}