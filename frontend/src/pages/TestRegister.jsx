import { useState } from 'react';
import api from '../lib/axios';

export default function TestRegister() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegister = async () => {
    setLoading(true);
    setResult('Testing registration...');

    const testData = {
      name: 'Test User Frontend',
      nip: '1234567890123460',
      email: 'testfrontend@example.com',
      password: 'Password123',
      password_confirmation: 'Password123',
      pangkat_golongan: 'Test Pangkat',
      jabatan: 'Test Jabatan',
      instansi: 'Test Instansi',
      no_wa: '081234567894',
      daftar_sebagai: 'UPT',
      organization_detail: 'Test Organization',
      status_pengguna: 'User'
    };

    try {
      console.log('Sending data:', testData);
      const response = await api.post('/register', testData);
      console.log('Response:', response);
      setResult(`SUCCESS: ${JSON.stringify(response.data)}`);
    } catch (error) {
      console.error('Error:', error);
      console.error('Error response:', error.response);
      setResult(`ERROR: ${error.message} - ${JSON.stringify(error.response?.data || {})}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Registration</h1>
      <button
        onClick={testRegister}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Register'}
      </button>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <pre className="whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
}