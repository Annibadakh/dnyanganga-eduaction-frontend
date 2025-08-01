// src/components/ImageSlider.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import { Autoplay } from 'swiper/modules';
import img1 from '../Images/studentstudying.jpg';
import img2 from '../Images/cap-bg.jpg';
import img3 from '../Images/Aboutus.jpg';   

const slides = [
  {
    title: 'Discover New Horizons',
    description: 'Explore the world with us and enjoy life-changing journeys.',
    image: img1,
  },
  {
    title: 'Adventure Awaits',
    description: 'Pack your bags for the most exciting trip ever!',
    image: img2,
  },
  {
    title: 'City Lights',
    description: 'Experience the buzz of the urban life like never before.',
    image: img3,
  },
];

const ImageSlider = () => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 3000 }}
        loop={true}
        className="border h-[250px] sm:h-[500px]"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
                className="w-full h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-cover sm:bg-cover bg-center bg-no-repeat flex items-center justify-center text-white text-center"
                style={{ backgroundImage: `url(${slide.image})` }}
            >
                <div className="bg-black bg-opacity-50 p-4 sm:p-6 rounded-lg max-w-xs sm:max-w-xl">
                <h2 className="text-lg sm:text-3xl font-bold mb-2">{slide.title}</h2>
                <p className="text-sm sm:text-lg">{slide.description}</p>
                </div>
            </div>
            </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
