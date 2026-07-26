import unittest
from app import app

class TestAindraPlatform(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home_page(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)

    def test_status_api(self):
        response = self.client.get('/api/status')
        self.assertEqual(response.status_code, 200)
        self.assertIn('version', response.json)

    def test_scenes_api(self):
        response = self.client.get('/api/scenes')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json['scenes']), 8)

if __name__ == '__main__':
    unittest.main()
