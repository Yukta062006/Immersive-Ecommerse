<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    private const CUSTOMERS = [
        ['name' => 'Aarav Sharma', 'email' => 'aarav.sharma@immersive.test'],
        ['name' => 'Priya Patel', 'email' => 'priya.patel@immersive.test'],
        ['name' => 'Rahul Verma', 'email' => 'rahul.verma@immersive.test'],
        ['name' => 'Ananya Iyer', 'email' => 'ananya.iyer@immersive.test'],
        ['name' => 'Vikram Singh', 'email' => 'vikram.singh@immersive.test'],
        ['name' => 'Sneha Reddy', 'email' => 'sneha.reddy@immersive.test'],
        ['name' => 'Karan Malhotra', 'email' => 'karan.malhotra@immersive.test'],
        ['name' => 'Ishita Gupta', 'email' => 'ishita.gupta@immersive.test'],
        ['name' => 'Aditya Nair', 'email' => 'aditya.nair@immersive.test'],
        ['name' => 'Meera Krishnan', 'email' => 'meera.krishnan@immersive.test'],
        ['name' => 'Rohan Joshi', 'email' => 'rohan.joshi@immersive.test'],
        ['name' => 'Kavya Menon', 'email' => 'kavya.menon@immersive.test'],
        ['name' => 'Arjun Desai', 'email' => 'arjun.desai@immersive.test'],
        ['name' => 'Diya Kapoor', 'email' => 'diya.kapoor@immersive.test'],
        ['name' => 'Ravi Shankar', 'email' => 'ravi.shankar@immersive.test'],
        ['name' => 'Pooja Bansal', 'email' => 'pooja.bansal@immersive.test'],
        ['name' => 'Siddharth Rao', 'email' => 'siddharth.rao@immersive.test'],
        ['name' => 'Neha Agarwal', 'email' => 'neha.agarwal@immersive.test'],
        ['name' => 'Manoj Kumar', 'email' => 'manoj.kumar@immersive.test'],
        ['name' => 'Ritika Mehta', 'email' => 'ritika.mehta@immersive.test'],
        ['name' => 'Sanjay Tripathi', 'email' => 'sanjay.tripathi@immersive.test'],
        ['name' => 'Tanvi Kulkarni', 'email' => 'tanvi.kulkarni@immersive.test'],
        ['name' => 'Abhishek Chawla', 'email' => 'abhishek.chawla@immersive.test'],
        ['name' => 'Shreya Dutta', 'email' => 'shreya.dutta@immersive.test'],
        ['name' => 'Nikhil Bose', 'email' => 'nikhil.bose@immersive.test'],
        ['name' => 'Aisha Khan', 'email' => 'aisha.khan@immersive.test'],
        ['name' => 'Yash Thakur', 'email' => 'yash.thakur@immersive.test'],
        ['name' => 'Riya Saxena', 'email' => 'riya.saxena@immersive.test'],
        ['name' => 'Gaurav Mishra', 'email' => 'gaurav.mishra@immersive.test'],
        ['name' => 'Sara Fernandes', 'email' => 'sara.fernandes@immersive.test'],
        ['name' => 'Harsh Vardhan', 'email' => 'harsh.vardhan@immersive.test'],
        ['name' => 'Anjali Chowdhury', 'email' => 'anjali.chowdhury@immersive.test'],
        ['name' => 'Kabir Anand', 'email' => 'kabir.anand@immersive.test'],
        ['name' => 'Divya Nambiar', 'email' => 'divya.nambiar@immersive.test'],
        ['name' => 'Farhan Ali', 'email' => 'farhan.ali@immersive.test'],
        ['name' => 'Simran Kaur', 'email' => 'simran.kaur@immersive.test'],
        ['name' => 'Varun Khanna', 'email' => 'varun.khanna@immersive.test'],
        ['name' => 'Navya Pillai', 'email' => 'navya.pillai@immersive.test'],
        ['name' => 'Sameer Bhatia', 'email' => 'sameer.bhatia@immersive.test'],
        ['name' => 'Tanya Mathur', 'email' => 'tanya.mathur@immersive.test'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::CUSTOMERS as $index => $customer) {
            User::query()->updateOrCreate(
                ['email' => $customer['email']],
                [
                    'name' => $customer['name'],
                    'password' => Hash::make('password'),
                    'role' => 'customer',
                    'created_at' => now()->subMonths(rand(2, 24))->subDays(rand(0, 27)),
                ]
            );
        }

        $this->command?->info('Customers seeded: '.count(self::CUSTOMERS));
    }
}