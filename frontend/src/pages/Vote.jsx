import Header from '../components/Header';
import Footer from '../components/Footer';

function Vote() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Vote</h2>
        <p>This is the Vote page.</p>
      </main>
      <Footer />
    </div>
  );
}

export default Vote; 