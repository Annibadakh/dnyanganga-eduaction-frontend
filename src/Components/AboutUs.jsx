import about from '../Images/about.jpg';  // Your first image
import bulb from '../Images/bulb.jpg';  // The second image

const AboutUs = () => {
    return (
        <section className="relative p-0 border-0 h-screen">
            <div className="relative w-full h-full">
                <img
                    src={about}
                    alt="AboutUs"
                    className="object-cover w-full h-[30%]"
                />
                {/* Transparent blue overlay on the upper part */}
                <div className="absolute inset-x-0 top-0 h-[30%] bg-blue-700 opacity-70"></div>
                {/* About Us text on top of the transparent blue overlay */}
                <div className="absolute inset-x-0 top-0 h-[30%] flex justify-center items-center text-white">
                    <h1 className="font-poppins text-[4vw] font-semibold text-center">About Us</h1>
                </div>
                {/* Lower section */}
                <div className="absolute inset-x-0 top-[30%] h-[70%] flex">
                    {/* Left side with 40% width and bulb image */}
                    <div className="w-[40%] h-full flex justify-center items-center">
                        <img
                            src={bulb}
                            alt="Bulb"
                            className="max-w-[95%] max-h-[95%] object-contain"
                        />
                    </div>
                    {/* Right side with 60% width and white background */}
                    <div className="w-[60%] h-full bg-white p-8 overflow-y-auto">
                        <h2 className="font-poppins text-[2vw] font-semibold mb-4">Our Motive</h2>
                        <p className="text-[1vw] leading-relaxed mb-4">
                            Our motive is to provide absolute flexibility & interactivity to the students who wish to take online tuitions. We aim to provide a barrier-free learning experience to the students of all age groups. At e-Tuitions, our priority is to provide the best online education to every student in India. Here, the Best Online Classes in India are provided to students.
                        </p>
                        <h3 className="font-poppins text-[2vw] font-semibold mb-4">What We Offer</h3>
                        <ul className="list-disc pl-6 mb-4">
                            <li>For all subjects in Class 5 to 12, for boards like CBSE, ICSE, ISC, IGCSE & all State Boards.</li>
                            <li>In every Indian language. Students can take classes in their mother tongue.</li>
                            <li><strong>In every state in India.</strong></li> {/* Bold */}
                        </ul>
                        <p className="text-[1vw] leading-relaxed mb-4">
                            At our online learning platform, students in school & college can find the best teachers, from all across India. So, whether you are a school student looking for online tuitions for any subject, a student preparing for IIT/ JEE, NEET, or you are a college student in search of an online course in French, this is the place for you to begin your learning journey. <strong className="text-[1.1vw]">e-Tuitions provides numerous courses & online tuitions.</strong> {/* Bold and slightly bigger font size */}
                        </p>
                    </div>
                </div>
                <div className="absolute inset-0 flex flex-col justify-center items-center">
                    <h2 className="text-white font-poppins text-[3.5vw] font-semibold mb-0 text-center">Our Mission and Vision</h2>
                </div>
            </div>
        </section>
    );
}

export default AboutUs;
