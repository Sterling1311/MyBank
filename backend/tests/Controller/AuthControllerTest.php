<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Doctrine\ORM\EntityManagerInterface;

class AuthControllerTest extends WebTestCase
{
    private function getEntityManager(): EntityManagerInterface
    {
        return static::getContainer()->get(EntityManagerInterface::class);
    }

    private function cleanUser(string $email): void
    {
        $em = $this->getEntityManager();
        $user = $em->getRepository(\App\Entity\User::class)->findOneBy(['email' => $email]);
        if ($user) {
            $em->remove($user);
            $em->flush();
        }
    }

    public function testRegisterSuccess(): void
    {
        $client = static::createClient();
        $this->cleanUser('testregister@mybank.com');

        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'testregister@mybank.com', 'password' => 'password123'])
        );

        $this->assertResponseStatusCodeSame(201);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertEquals('testregister@mybank.com', $data['user']['email']);

        $this->cleanUser('testregister@mybank.com');
    }

    public function testRegisterMissingFields(): void
    {
        $client = static::createClient();

        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'test@mybank.com'])
        );

        $this->assertResponseStatusCodeSame(400);
    }

    public function testRegisterDuplicateEmail(): void
    {
        $client = static::createClient();
        $this->cleanUser('duplicate@mybank.com');

        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'duplicate@mybank.com', 'password' => 'password123'])
        );
        $this->assertResponseStatusCodeSame(201);

        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'duplicate@mybank.com', 'password' => 'password123'])
        );

        $statusCode = $client->getResponse()->getStatusCode();
        $this->assertContains($statusCode, [400, 409]);

        $this->cleanUser('duplicate@mybank.com');
    }

    public function testLoginSuccess(): void
    {
        $client = static::createClient();
        $this->cleanUser('testlogin@mybank.com');

        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'testlogin@mybank.com', 'password' => 'password123'])
        );

        $client->request('POST', '/api/auth/login', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'testlogin@mybank.com', 'password' => 'password123'])
        );

        $this->assertResponseStatusCodeSame(200);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $data);

        $this->cleanUser('testlogin@mybank.com');
    }

    public function testLoginWrongPassword(): void
    {
        $client = static::createClient();
        $this->cleanUser('wrongpass@mybank.com');

        $client->request('POST', '/api/auth/register', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'wrongpass@mybank.com', 'password' => 'password123'])
        );

        $client->request('POST', '/api/auth/login', [], [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => 'wrongpass@mybank.com', 'password' => 'wrongpassword'])
        );

        $this->assertResponseStatusCodeSame(401);

        $this->cleanUser('wrongpass@mybank.com');
    }
}