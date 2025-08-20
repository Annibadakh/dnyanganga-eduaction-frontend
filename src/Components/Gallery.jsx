import React, { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    {
      src: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg',
      alt: 'Students during mock exam',
      category: 'Exams'
    },
    {
      src: 'https://images.pexels.com/photos/5427674/pexels-photo-5427674.jpeg',
      alt: 'Expert lecture session',
      category: 'Seminars'
    },
    {
      src: 'https://images.pexels.com/photos/5212700/pexels-photo-5212700.jpeg',
      alt: 'Modern exam center',
      category: 'Facilities'
    },
    {
      src: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
      alt: 'Award ceremony',
      category: 'Events'
    },
    {
      src: 'https://images.pexels.com/photos/5427659/pexels-photo-5427659.jpeg',
      alt: 'Study material distribution',
      category: 'Activities'
    },
    {
      src: 'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg',
      alt: 'Group study session',
      category: 'Activities'
    }
  ];

  return (
    <section className="py-16 bg-customwhite">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className='mb-10'>
                <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>Gallery</h1>
                <div className='md:w-48 w-40 h-2 bg-secondary'></div>
            </div>
          {/* <h2 className="text-3xl md:text-4xl font-bold text-customblack mb-4 font-custom">
            Gallery
          </h2> */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Glimpses of our educational journey and student achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-custom"
              onClick={() => setSelectedImage(image.src)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-customwhite opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <span className="text-customwhite text-sm font-medium">{image.category}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for enlarged image */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-customwhite hover:text-secondary transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;
