
import aboutimg from '../Images/aboutimg.png';  
import greendots from '../Images/greendots.png';

const AboutUs = () => {
    return (
        <section className="flex h-screen">
            <div className="w-1/2 h-full pl-0 flex justify-center items-center relative">
                <img
                    src={greendots}
                    alt="Green Dots"
                    className="absolute top-[0%] left-[5%] w-1/3 h-auto z-0" 
                />

                <img
                    src={aboutimg}
                    alt="About Us"
                    className="object-cover w-[70%] h-[80%] m-10 p-5 rounded-3xl z-10" 
                />
            </div>

            <div className="w-1/2 h-full bg-white p-8 flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-4">About Us</h1>
                <p className="text-lg text-gray-700">
                    We are a team of passionate individuals dedicated to creating innovative solutions that make a difference. Our mission is to provide high-quality services that exceed expectations.
                </p>
            </div>
        </section>
    );
}

export default AboutUs;
