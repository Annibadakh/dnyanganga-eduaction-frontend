import { useState, useEffect } from 'react';
import api from '../Api';
import { useAuth } from '../Context/AuthContext';
import Excel from './Excel';
import { Users, FileText, MapPin, GraduationCap, TrendingUp } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const [hallTicket, setHallTicket] = useState(false);
  const [resultDeclared, setResultDeclared] = useState(false);
  const [hallLoading, setHallLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalStudents: 0,
    byStandard: {},
    byExamCentre: {},
    byBranch: {},
    recentRegistrations: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    counsellor: '',
    branch: '',
    examCentre: '',
    standard: ''
  });
  
  // Dropdown options
  const [counsellors, setCounsellors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [examCentres, setExamCentres] = useState([]);
  const standards = ['9th+10th', '10th', '11th+12th', '12th'];

  const getFlag = () => {
    api.get('/admin/getSettingFlags')
      .then(res => {
        const data = res.data.data;
        const hallTicketFlag = data.find(flag => flag.flagName === 'HALLTICKET');
        const resultDeclaredFlag = data.find(flag => flag.flagName === 'RESULT');

        if (hallTicketFlag) setHallTicket(hallTicketFlag.flagValue === 'true');
        if (resultDeclaredFlag) setResultDeclared(resultDeclaredFlag.flagValue === 'true');
      })
      .catch(err => console.error('Error fetching flags', err));
  };

  const fetchDropdownData = async () => {
    try {
      // Fetch branches for admin
      // if (user.role === 'admin') {
      //   const branchRes = await api.get('/admin/getBranches');
      //   setBranches(branchRes.data.data || []);
      // }
      
      // Fetch exam centres
      const centreRes = await api.get('/admin/getExamCenters');
      setExamCentres(centreRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // const fetchStatistics = async () => {
  //   setStatsLoading(true);
  //   try {
  //     const queryParams = new URLSearchParams();
  //     if (filters.branch) queryParams.append('branch', filters.branch);
  //     if (filters.examCentre) queryParams.append('examCentre', filters.examCentre);
  //     if (filters.standard) queryParams.append('standard', filters.standard);

  //     const response = await api.get(`/admin/getStatistics?${queryParams.toString()}`);
  //     setStats(response.data.data);
  //   } catch (error) {
  //     console.error('Error fetching statistics:', error);
  //   } finally {
  //     setStatsLoading(false);
  //   }
  // };

  useEffect(() => {
    setHallLoading(true);
    setResultLoading(true);
    getFlag();
    fetchDropdownData();
    setHallLoading(false);
    setResultLoading(false);
  }, []);

  // useEffect(() => {
  //   fetchStatistics();
  // }, [filters]);

  const toggleFlag = async (flagName, currentValue) => {
    if (flagName === "RESULT") setResultLoading(true);
    else if (flagName === "HALLTICKET") setHallLoading(true);

    try {
      await api.put(`/admin/updateSettingFlag/${flagName}`, {
        flagValue: (!currentValue).toString(),
      });
      getFlag();
    } catch (error) {
      console.error(`Error updating ${flagName}`, error);
    } finally {
      setHallLoading(false);
      setResultLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      branch: '',
      examCentre: '',
      standard: ''
    });
  };

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Counsellor Dashboard'}
          </h1>
          
        </div>

        {/* Filters Panel */}
        
          {/* <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <select
                  value={filters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Branches</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Centre</label>
                <select
                  value={filters.examCentre}
                  onChange={(e) => handleFilterChange('examCentre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Centres</option>
                  {examCentres.map(centre => (
                    <option key={centre.centerId} value={centre.centerId}>
                      {centre.centerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard</label>
                <select
                  value={filters.standard}
                  onChange={(e) => handleFilterChange('standard', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Standards</option>
                  {standards.map(std => (
                    <option key={std} value={std}>{std}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div> */}

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Registrations"
            value={stats.totalStudents}
            icon={Users}
            color="text-blue-600"
            loading={statsLoading}
          />
          <StatCard
            title="Recent (7 days)"
            value={stats.recentRegistrations}
            icon={TrendingUp}
            color="text-green-600"
            loading={statsLoading}
          />
         
        </div> */}

        {/* Detailed Statistics */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> */}
          {/* By Standard */}
          {/* <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Students by Standard
            </h2>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(stats.byStandard || {}).map(([standard, count]) => (
                  <div key={standard} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-700">{standard}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* By Exam Centre */}
          {/* <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Students by Exam Centre
            </h2>
            {statsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(stats.byExamCentre || {}).map(([centre, count]) => (
                  <div key={centre} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium text-gray-700 text-sm">{centre}</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div> */}
        {/* </div> */}

        {/* Admin Controls & Excel Export */}
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Admin Control Panel */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Controls</h2>

              {/* Hall Ticket Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Hall Ticket</span>
                  {hallLoading ? (
                    <span className="animate-spin h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                  ) : (
                    <button
                      onClick={() => toggleFlag('HALLTICKET', hallTicket)}
                      className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                        hallTicket ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                          hallTicket ? 'translate-x-7' : ''
                        }`}
                      ></div>
                    </button>
                  )}
                </div>
                {/* <p className="text-xs text-gray-500">
                  {hallTicket ? 'Hall tickets are visible to students' : 'Hall tickets are hidden from students'}
                </p> */}
              </div>

              {/* Result Declared Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">Result Declared</span>
                  {resultLoading ? (
                    <span className="animate-spin h-7 w-7 border-2 border-blue-600 border-t-transparent rounded-full"></span>
                  ) : (
                    <button
                      onClick={() => toggleFlag('RESULT', resultDeclared)}
                      className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${
                        resultDeclared ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${
                          resultDeclared ? 'translate-x-7' : ''
                        }`}
                      ></div>
                    </button>
                  )}
                </div>
                {/* <p className="text-xs text-gray-500">
                  {resultDeclared ? 'Results are visible to students' : 'Results are hidden from students'}
                </p> */}
              </div>
            </div>

            {/* Excel Export Panel */}
            <div className="lg:col-span-2">
              <Excel />
            </div>
          </div>
        )}

        {/* Counsellor Branch Info */}
        {user.role !== 'admin' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Your Statistics</h2>
            </div>
            <p className="text-gray-600">
              Showing registrations created by you. Total registrations: <span className="font-bold text-blue-600">{stats.totalStudents}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}