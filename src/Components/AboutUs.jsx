import aboutimg from '../Images/aboutimg.png';  // Your image file
import greendots from '../Images/greendots.png'; // Your greendots image

const AboutUs = () => {
    return (
        <section className="flex h-screen">
            {/* Left side with the images */}
            <div className="w-1/2 h-full pl-0 flex justify-center items-center relative">
                {/* Green dots image positioned behind and adjusted */}
                <img
                    src={greendots}
                    alt="Green Dots"
                    className="absolute top-[-10%] left-[-10%] w-1/2 h-auto z-0" // Adjusted to move it left and up
                />

                {/* About image moved further lower */}
                <img
                    src={aboutimg}
                    alt="About Us"
                    className="object-cover w-[70%] h-[80%] rounded-3xl ml-[-15%] mt-[-10%] z-10" // Moved further lower
                />
            </div>

            {/* Right side with the text */}
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
