import aboutimg from '../Images/aboutimg.png';  
import greendots from '../Images/greendots.png';

const AboutUs = () => {
    return (
        <>
        <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>About Us</h1>
                <div className='md:w-48 w-32 h-2 bg-secondary'></div>
            </div>
        <section className="flex flex-col md:flex-row h-auto md:h-screen">
            {/* Image Section */}
            
            <div className="w-full md:w-1/2 h-auto md:h-full pl-0 flex justify-center items-center relative">
                <img
                    src={greendots}
                    alt="Green Dots"
                    className="absolute top-[0%] left-[5%] w-1/3 h-auto z-0" 
                />
                <img
                    src={aboutimg}
                    alt="About Us"
                    className="object-cover w-[80%] sm:w-[70%] md:w-[70%] h-auto md:h-[80%] m-10 p-5 rounded-3xl z-10" 
                />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 h-auto md:h-full bg-white p-6 sm:p-8 md:p-8 flex flex-col justify-center text-center md:text-left">
                <h1 className="text-3xl font-bold mb-4">About Us</h1>
                <p className="text-lg text-gray-700">
                    We are a team of passionate individuals dedicated to creating innovative solutions that make a difference. Our mission is to provide high-quality services that exceed expectations.
                </p>
            </div>
        </section>
        </>
    );
}

export default AboutUs;
