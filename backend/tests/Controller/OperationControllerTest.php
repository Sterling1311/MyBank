<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Entity\Category;

class OperationControllerTest extends WebTestCase
{
    private function getEntityManager(): EntityManagerInterface
    {
        return static::getContainer()->get(EntityManagerInterface::class);
    }

    private function createUserAndLogin(object $client, string $email, string $password): string
    {
        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'password' => $password])
        );

        $client->request('POST', '/api/auth/login', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'password' => $password])
        );

        $data = json_decode($client->getResponse()->getContent(), true);
        return $data['token'];
    }

    private function cleanUser(string $email): void
    {
        $em = $this->getEntityManager();
        $user = $em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($user) {
            $em->remove($user);
            $em->flush();
        }
    }

    private function createCategory(string $name): int
    {
        $em = $this->getEntityManager();
        $existing = $em->getRepository(Category::class)->findOneBy(['name' => $name]);
        if ($existing) return $existing->getId();

        $category = new Category();
        $category->setName($name);
        $category->setCreatedAt(new \DateTime());
        $em->persist($category);
        $em->flush();
        return $category->getId();
    }

    public function testCreateOperationSuccess(): void
    {
        $client = static::createClient();
        $email = 'optest@mybank.com';
        $this->cleanUser($email);
        $token = $this->createUserAndLogin($client, $email, 'password123');
        $categoryId = $this->createCategory('TestFood');

        $client->request('POST', '/api/operations', [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ],
            json_encode([
                'label' => 'Test Groceries',
                'amount' => -45.50,
                'date' => '2025-06-01',
                'category_id' => $categoryId
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertEquals('Test Groceries', $data['label']);
        $this->cleanUser($email);
    }

    public function testCreateOperationMissingFields(): void
    {
        $client = static::createClient();
        $email = 'optest2@mybank.com';
        $this->cleanUser($email);
        $token = $this->createUserAndLogin($client, $email, 'password123');

        $client->request('POST', '/api/operations', [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ],
            json_encode(['label' => 'Test'])
        );

        $this->assertResponseStatusCodeSame(400);
        $this->cleanUser($email);
    }

    public function testCreateOperationUnauthorized(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/operations', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'label' => 'Test',
                'amount' => -10,
                'date' => '2025-06-01',
                'category_id' => 1
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }

    public function testListOperations(): void
    {
        $client = static::createClient();
        $email = 'optest3@mybank.com';
        $this->cleanUser($email);
        $token = $this->createUserAndLogin($client, $email, 'password123');

        $client->request('GET', '/api/operations', [], [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertIsArray($data);
        $this->cleanUser($email);
    }

    public function testDeleteOperation(): void
    {
        $client = static::createClient();
        $email = 'optest4@mybank.com';
        $this->cleanUser($email);
        $token = $this->createUserAndLogin($client, $email, 'password123');
        $categoryId = $this->createCategory('TestFood');

        $client->request('POST', '/api/operations', [], [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ],
            json_encode([
                'label' => 'To Delete',
                'amount' => -10,
                'date' => '2025-06-01',
                'category_id' => $categoryId
            ])
        );

        $data = json_decode($client->getResponse()->getContent(), true);
        $operationId = $data['id'];

        $client->request('DELETE', '/api/operations/' . $operationId, [], [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseStatusCodeSame(200);
        $this->cleanUser($email);
    }
}