import Head from 'next/head';
import Image from 'next/image';
import supercat from '../public/img/supercat.svg';

const MaintenancePage = () => {
  return (
    <>
      <Head>
        <title>Site Maintenance | My Website</title>
      </Head>
      <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center">
        <div className="max-w-md mx-auto text-center">
          <Image src={supercat} alt="Maintenance" width={500} height={500} />
          <h1 className="text-4xl font-bold text-gray-800 mt-8 mb-4">Site Maintenance</h1>
          <p className="text-lg text-gray-600 mb-8">We are currently performing some maintenance on our site.</p>
          {/* <div className="flex flex-col md:flex-row gap-4">
            <a href="/" className="btn btn-primary">Home</a>
            <a href="/contact" className="btn btn-secondary">Contact Us</a>
          </div> */}
        </div>
      </div>
    </>
  )
}

export default MaintenancePage;