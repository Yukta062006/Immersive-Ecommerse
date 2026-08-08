<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_returns_201_with_root_tokens_and_user(): void
    {
        $response = $this->postJson('/api/auth/signup', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'StrongPass123!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'accessToken',
                'refreshToken',
                'user' => ['id', 'name', 'email', 'role', 'createdAt'],
            ])
            ->assertJsonPath('user.role', 'customer')
            ->assertJsonPath('user.email', 'jane@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'jane@example.com',
            'role' => 'customer',
        ]);
    }

    public function test_register_endpoint_alias_works(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Jane Doe',
            'email' => 'jane2@example.com',
            'password' => 'StrongPass123!',
        ])->assertStatus(201);
    }

    public function test_registration_requires_password_confirmationless_valid_data(): void
    {
        $this->postJson('/api/auth/signup', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dup@example.com']);

        $this->postJson('/api/auth/signup', [
            'name' => 'Dup',
            'email' => 'dup@example.com',
            'password' => 'StrongPass123!',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_returns_tokens_and_user(): void
    {
        $user = User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'StrongPass123!',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'StrongPass123!',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['accessToken', 'refreshToken', 'user'])
            ->assertJsonPath('user.email', 'login@example.com');

        $this->assertTrue($response->json('accessToken') !== $response->json('refreshToken'));
    }

    public function test_login_rejects_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'login@example.com',
            'password' => 'StrongPass123!',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'login@example.com',
            'password' => 'WrongPassword1!',
        ])->assertStatus(422);
    }

    public function test_me_requires_auth(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Me User']);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('user.name', 'Me User')
            ->assertJsonPath('user.id', (string) $user->id);
    }

    public function test_refresh_rotates_tokens(): void
    {
        $user = User::factory()->create();
        $access = $user->createToken('access', ['access'])->plainTextToken;
        $refresh = $user->createToken('refresh', ['refresh'])->plainTextToken;

        $response = $this->postJson('/api/auth/refresh', [
            'refreshToken' => $refresh,
        ]);

        $response->assertOk()
            ->assertJsonStructure(['accessToken', 'refreshToken']);

        $newRefresh = $response->json('refreshToken');
        $this->assertNotSame($refresh, $newRefresh);

        $this->assertSame(1, $user->tokens()->where('name', 'refresh')->count());
        $this->assertFalse(PersonalAccessToken::findToken($refresh) !== null);
    }

    public function test_refresh_rejects_invalid_token(): void
    {
        $this->postJson('/api/auth/refresh', [
            'refreshToken' => 'invalid-token',
        ])->assertStatus(401);
    }

    public function test_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertSame(0, $user->tokens()->count());
    }
}
