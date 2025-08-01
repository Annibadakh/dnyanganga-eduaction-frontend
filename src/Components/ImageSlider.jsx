// src/components/ImageSlider.jsx
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import img1 from '../Images/studentstudying.jpg';
import img2 from '../Images/peoples.jpg';
import img3 from '../Images/Aboutus.jpg';   

const slides = [
  {
    title: 'Dedicated to delivering quality.',
    description: 'From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow. Our team of experienced educators ensures a nurturing environment that fosters learning, growth, and success.',
    image: img1,
  },
  {
    title: 'Empowering students for academic.',
    description: 'Dnyangange Education is a trusted name in providing comprehensive educational services. From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow.',
    image: img2,
  },
  {
    title: 'Dedicated to delivering quality.',
    description: 'Dnyangange Education is a trusted name in providing comprehensive educational services. From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow.',
    image: img3,
  },
  {
    title: 'Dedicated to delivering quality.',
    description: 'From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow. Our team of experienced educators ensures a nurturing environment that fosters learning, growth, and success.',
    image: img1,
  },
  {
    title: 'Empowering students for academic.',
    description: 'Dnyangange Education is a trusted name in providing comprehensive educational services. From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow.',
    image: img2,
  },
  {
    title: 'Dedicated to delivering quality.',
    description: 'Dnyangange Education is a trusted name in providing comprehensive educational services. From expert guidance to innovative teaching methods, we are committed to preparing students for a brighter tomorrow.',
    image: img3,
  },
];

const ImageSlider = () => {
  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 3000 }}
        loop={true}
        pagination={{ clickable: true }}
        navigation={true}
        className="border h-[250px] sm:h-[500px]"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
                className="w-full md:pl-16 opacity-90 h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-cover sm:bg-cover bg-center bg-no-repeat flex items-center justify-center md:justify-start text-white text-center"
                style={{ backgroundImage: `url(${slide.image})` }}
            >
                <div className="bg-white bg-opacity-40  p-4 sm:p-6 rounded-lg max-w-xs sm:min-h-72 sm:max-w-xl">
                <h2 className="text-lg text-primary sm:text-3xl font-bold mb-5">{slide.title}</h2>
                <p className="text-sm text-black text-justify sm:text-lg">{slide.description}</p>
                </div>
            </div>
            </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ImageSlider;
