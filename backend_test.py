#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime

class IFSSeedsAPITester:
    def __init__(self, base_url="https://seedvault-admin.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.admin_user_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_msg = response.json()
                    print(f"   Error: {error_msg}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test seeding initial data"""
        success, response = self.run_test(
            "Seed Initial Data",
            "POST",
            "seed-initial-data",
            200
        )
        return success

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com",
            "phone": "9876543210",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   User registered with ID: {self.user_id}")
        
        return success

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@ifsseeds.com",
            "password": "admin123"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=admin_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            self.admin_user_id = response['user']['id']
            print(f"   Admin logged in with ID: {self.admin_user_id}")
        
        return success

    def test_get_products(self):
        """Test getting products"""
        success, response = self.run_test(
            "Get Products",
            "GET",
            "products",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
        
        return success

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET",
            "categories",
            200
        )
        return success

    def test_razorpay_config(self):
        """Test Razorpay configuration"""
        success, response = self.run_test(
            "Razorpay Config",
            "GET",
            "razorpay/config",
            200
        )
        
        if success and 'key_id' in response:
            print(f"   Razorpay Key ID: {response['key_id']}")
        
        return success

    def test_coupon_validation(self):
        """Test coupon validation"""
        coupon_data = {
            "code": "WELCOME20",
            "subtotal": 600
        }
        
        success, response = self.run_test(
            "Coupon Validation",
            "POST",
            "coupons/validate",
            200,
            data=coupon_data
        )
        
        if success and response.get('valid'):
            print(f"   Coupon discount: ₹{response.get('discount', 0)}")
        
        return success

    def test_admin_dashboard_stats(self):
        """Test admin dashboard stats"""
        success, response = self.run_test(
            "Admin Dashboard Stats",
            "GET",
            "admin/dashboard/stats",
            200,
            use_admin=True
        )
        
        if success:
            stats = ['total_orders', 'total_customers', 'total_products', 'total_revenue']
            for stat in stats:
                print(f"   {stat}: {response.get(stat, 0)}")
        
        return success

    def test_admin_products_crud(self):
        """Test admin products CRUD operations"""
        # Create product
        product_data = {
            "name": "Test Seed SR-99",
            "variety": "SR-99",
            "category": "Test Category",
            "description": "Test seed for API testing",
            "image": "https://example.com/test-image.jpg",
            "features": ["Test feature 1", "Test feature 2"],
            "variants": [
                {
                    "name": "1 KG Pack",
                    "weight": "1 KG",
                    "price": 100,
                    "original_price": 150,
                    "stock": 50,
                    "sku": "TEST-1KG"
                }
            ],
            "is_active": True
        }
        
        success, response = self.run_test(
            "Create Product (Admin)",
            "POST",
            "admin/products",
            200,
            data=product_data,
            use_admin=True
        )
        
        product_id = None
        if success and 'id' in response:
            product_id = response['id']
            print(f"   Product created with ID: {product_id}")
            
            # Update product
            update_data = {**product_data, "name": "Updated Test Seed SR-99"}
            update_success, _ = self.run_test(
                "Update Product (Admin)",
                "PUT",
                f"admin/products/{product_id}",
                200,
                data=update_data,
                use_admin=True
            )
            
            # Delete product
            delete_success, _ = self.run_test(
                "Delete Product (Admin)",
                "DELETE",
                f"admin/products/{product_id}",
                200,
                use_admin=True
            )
            
            return success and update_success and delete_success
        
        return success

    def test_admin_coupons(self):
        """Test admin coupons management"""
        # Get coupons
        success, response = self.run_test(
            "Get Coupons (Admin)",
            "GET",
            "admin/coupons",
            200,
            use_admin=True
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} coupons")
        
        return success

    def test_admin_customers(self):
        """Test admin customers list"""
        success, response = self.run_test(
            "Get Customers (Admin)",
            "GET",
            "admin/customers",
            200,
            use_admin=True
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} customers")
        
        return success

    def test_admin_orders(self):
        """Test admin orders management"""
        success, response = self.run_test(
            "Get All Orders (Admin)",
            "GET",
            "admin/orders",
            200,
            use_admin=True
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} orders")
        
        return success

    def test_admin_inventory(self):
        """Test admin inventory management"""
        success, response = self.run_test(
            "Get Inventory (Admin)",
            "GET",
            "admin/inventory",
            200,
            use_admin=True
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} inventory items")
        
        return success

    def test_admin_smtp_settings(self):
        """Test admin SMTP settings"""
        success, response = self.run_test(
            "Get SMTP Settings (Admin)",
            "GET",
            "admin/settings/smtp",
            200,
            use_admin=True
        )
        
        if success and 'smtp_server' in response:
            print(f"   SMTP Server: {response.get('smtp_server', 'Not configured')}")
        
        return success

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test User",
            "phone": "9876543210",
            "email": "test@example.com",
            "subject": "API Test Message",
            "message": "This is a test message from the API testing suite."
        }
        
        success, response = self.run_test(
            "Contact Form Submission",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        
        return success

def main():
    print("🚀 Starting IFS Seeds E-commerce API Tests")
    print("=" * 50)
    
    tester = IFSSeedsAPITester()
    
    # Critical functionality tests
    critical_tests = [
        tester.test_seed_data,
        tester.test_user_registration,
        tester.test_admin_login,
        tester.test_get_products,
        tester.test_get_categories,
        tester.test_razorpay_config,
    ]
    
    # Admin functionality tests (require admin login)
    admin_tests = [
        tester.test_admin_dashboard_stats,
        tester.test_admin_products_crud,
        tester.test_admin_coupons,
        tester.test_admin_customers,
        tester.test_admin_orders,
        tester.test_admin_inventory,
        tester.test_admin_smtp_settings,
    ]
    
    # Additional tests
    additional_tests = [
        tester.test_coupon_validation,
        tester.test_contact_form,
    ]
    
    # Run tests
    print("\n🔧 Running Critical Tests...")
    for test in critical_tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            tester.tests_run += 1
    
    # Only run admin tests if admin login was successful
    if tester.admin_token:
        print("\n👑 Running Admin Tests...")
        for test in admin_tests:
            try:
                test()
            except Exception as e:
                print(f"❌ Admin test failed with exception: {e}")
                tester.tests_run += 1
    else:
        print("\n⚠️  Skipping admin tests - admin login failed")
    
    print("\n🔧 Running Additional Tests...")
    for test in additional_tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Additional test failed with exception: {e}")
            tester.tests_run += 1
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 ALL TESTS PASSED!")
        return 0
    else:
        print("❌ Some tests failed - check output above for details")
        return 1

if __name__ == "__main__":
    sys.exit(main())