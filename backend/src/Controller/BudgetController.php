<?php

namespace App\Controller;

use App\Entity\Budget;
use App\Entity\User;
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
        Request $request,
        BudgetRepository $repo,
        OperationRepository $operationRepo
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();
        $month = $request->query->get('month');
        $budgets = $repo->findBy(['user' => $user]);

        $data = array_map(function ($b) use ($operationRepo, $month, $user) {
            $qb = $operationRepo->createQueryBuilder('o')
                ->where('o.user = :user')
                ->andWhere('o.category = :category')
                ->setParameter('user', $user)
                ->setParameter('category', $b->getCategory());

            if ($month) {
                [$year, $m] = explode('-', $month);
                $start = new \DateTime("$year-$m-01");
                $end = (clone $start)->modify('last day of this month');
                $qb->andWhere('o.date >= :start')->andWhere('o.date <= :end')
                   ->setParameter('start', $start)
                   ->setParameter('end', $end);
            }

            $operations = $qb->getQuery()->getResult();

            $spent = array_reduce($operations, function ($carry, $op) {
                $amount = (float) $op->getAmount();
                if ($amount < 0) $carry += abs($amount);
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

        $allOpsQb = $operationRepo->createQueryBuilder('o')
            ->where('o.user = :user')
            ->setParameter('user', $user);

        if ($month) {
            [$year, $m] = explode('-', $month);
            $end = (new \DateTime("$year-$m-01"))->modify('last day of this month');
            $allOpsQb->andWhere('o.date <= :end')->setParameter('end', $end);
        }

        $allOperations = $allOpsQb->getQuery()->getResult();
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
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (empty($data['category_id']) || !isset($data['allocated_amount'])) {
            return $this->json(['error' => 'category_id and allocated_amount are required'], 400);
        }

        $category = $categoryRepo->find($data['category_id']);
        if (!$category) {
            return $this->json(['error' => 'Category not found'], 404);
        }

        $existing = $budgetRepo->findOneBy([
            'user' => $user,
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
        $budget->setUser($user);
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
        /** @var User $user */
        $user = $this->getUser();
        $budget = $repo->find($id);

        if (!$budget || $budget->getUser() !== $user) {
            return $this->json(['error' => 'Budget not found'], 404);
        }

        $em->remove($budget);
        $em->flush();

        return $this->json(['message' => 'Budget deleted']);
    }
}