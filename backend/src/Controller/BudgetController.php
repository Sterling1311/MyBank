<?php

namespace App\Controller;

use App\Entity\Budget;
use App\Repository\BudgetRepository;
use App\Repository\CategoryRepository;
use App\Repository\OperationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/budgets')]
class BudgetController extends AbstractController
{
    #[Route('', name: 'budget_list', methods: ['GET'])]
    public function index(
        BudgetRepository $repo,
        OperationRepository $operationRepo
    ): JsonResponse {
        $budgets = $repo->findBy(['user' => $this->getUser()]);

        $data = array_map(function ($b) use ($operationRepo) {
            $operations = $operationRepo->findBy([
                'user' => $this->getUser(),
                'category' => $b->getCategory()
            ]);

            $spent = array_reduce($operations, function ($carry, $op) {
                $amount = (float) $op->getAmount();
                if ($amount < 0) {
                    $carry += abs($amount);
                }
                return $carry;
            }, 0);

            $allocated = (float) $b->getAllocatedAmount();
            $remaining = $allocated - $spent;

            return [
                'id' => $b->getId(),
                'category' => [
                    'id' => $b->getCategory()->getId(),
                    'name' => $b->getCategory()->getName(),
                ],
                'allocated_amount' => $allocated,
                'spent' => $spent,
                'remaining' => $remaining,
                'percentage_used' => $allocated > 0 ? round(($spent / $allocated) * 100, 1) : 0,
            ];
        }, $budgets);

        // Solde global
        $allOperations = $operationRepo->findBy(['user' => $this->getUser()]);
        $totalBalance = array_reduce($allOperations, function ($carry, $op) {
            return $carry + (float) $op->getAmount();
        }, 0);

        return $this->json([
            'total_balance' => round($totalBalance, 2),
            'budgets' => $data
        ]);
    }

    #[Route('', name: 'budget_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepo,
        BudgetRepository $budgetRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['category_id']) || !isset($data['allocated_amount'])) {
            return $this->json(['error' => 'category_id and allocated_amount are required'], 400);
        }

        $category = $categoryRepo->find($data['category_id']);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        $existing = $budgetRepo->findOneBy([
            'user' => $this->getUser(),
            'category' => $category
        ]);

        if ($existing) {
            $existing->setAllocatedAmount($data['allocated_amount']);
            $em->flush();
            return $this->json([
                'id' => $existing->getId(),
                'category' => ['id' => $category->getId(), 'name' => $category->getName()],
                'allocated_amount' => (float) $existing->getAllocatedAmount(),
            ]);
        }

        $budget = new Budget();
        $budget->setAllocatedAmount($data['allocated_amount']);
        $budget->setCategory($category);
        $budget->setUser($this->getUser());
        $budget->setCreatedAt(new \DateTime());

        $em->persist($budget);
        $em->flush();

        return $this->json([
            'id' => $budget->getId(),
            'category' => ['id' => $category->getId(), 'name' => $category->getName()],
            'allocated_amount' => (float) $budget->getAllocatedAmount(),
        ], 201);
    }

    #[Route('/{id}', name: 'budget_delete', methods: ['DELETE'])]
    public function delete(
        int $id,
        BudgetRepository $repo,
        EntityManagerInterface $em
    ): JsonResponse {
        $budget = $repo->find($id);

        if (!$budget || $budget->getUser() !== $this->getUser()) {
            return $this->json(['error' => 'Budget not found'], 404);
        }

        $em->remove($budget);
        $em->flush();

        return $this->json(['message' => 'Budget deleted']);
    }
}