import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, TrendingUp, ArrowRight, Landmark, House, School, School2 } from 'lucide-react';
import api from "../Api";

const ExamCentersPreview = () => {
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const res = await api.get("/simple/examCenter?limit=6");
        setCenters(res.data.data);
      } catch (err) {
        console.error("Error fetching centers", err);
      }
    };

    fetchCenters();
  }, []);
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-12">
          <div className='mb-10'>
            <h1 className='md:w-72 w-52 p-2 capitalize text-white text-xl md:text-2xl font-semibold md:pr-10 pr-5 text-end mb-2 bg-primary'>
              Exam Centres
            </h1>
            <div className='md:w-48 w-40 h-2 bg-secondary'></div>
          </div>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Top performing exam centres based on student registrations
          </p>
        </div>

        {/* Centers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {centers.map((center, index) => {
            const remaining = (center.capicity || 0) - center.studentCount;

            return (
              <div
                key={center.centerId}
                className="relative bg-customwhite rounded-xl shadow-custom overflow-hidden transform hover:scale-105 transition-all duration-300"
              >
                {index === 0 && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                    Top Centre
                  </div>
                )}

                <div className="flex items-center justify-center h-28 bg-primary/10">
                  <School2 size={70} className="text-primary" />
                </div>
                {/* <div className="relative h-44">
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585"
                    alt="Exam Center"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>

                  {index === 0 && (
                    <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded">
                      Top Center
                    </div>
                  )}
                </div> */}


                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-customblack mb-2 text-center">
                    {center.centerName}
                  </h3>

                  <div className="space-y-3 mt-4">

                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm">
                        {center.collegeName || "N/A"}
                      </span>
                    </div>

                    {/* Students */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        {center.studentCount} Students
                      </span>
                    </div>

                    {/* Capacity */}
                    {/* <div className="flex items-center gap-2 text-gray-600">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">
                        Capacity: {center.capicity || "N/A"}
                      </span>
                    </div> */}

                    {/* Remaining */}
                    {/* <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-red-500" />
                      <span className="text-sm">
                        Remaining: {remaining >= 0 ? remaining : 0}
                      </span>
                    </div> */}

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Button */}
        <div className="text-center">
          <Link
            to="/exam-centers"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-opacity-90 text-customwhite px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <span>Explore All Centres</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

export default ExamCentersPreview;