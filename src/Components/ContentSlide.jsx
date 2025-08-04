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

const ContentSlide = () => {
  return (
    <>
    <div className='mb-10 mt-10'>
                <h1 className='md:w-72 w-52 p-2 text-white capitalize text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Our Experts</h1>
                <div className='md:w-48 w-32 h-2 bg-secondary'></div>
    </div>
    <div className="w-full">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 4000 }}
        loop={true}
        className="w-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex flex-col md:flex-row items-center justify-center w-full h-full px-4 md:px-16 py-8 gap-6">
              {/* Image Section */}
              <div className="w-full md:w-1/2">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-auto rounded-lg shadow-md object-cover"
                />
              </div>

              {/* Text Section */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">{slide.title}</h2>
                <p className="text-base md:text-lg text-gray-700 dark:text-gray-300">{slide.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
    </>
    
  );
};

export default ContentSlide;
