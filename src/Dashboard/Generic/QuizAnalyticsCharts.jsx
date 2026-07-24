import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = {
  correct: "#22c55e",
  wrong: "#ef4444",
  notAttempted: "#9ca3af",
  primary: "#2563eb",
  secondary: "#7c3aed",
  accent: "#f59e0b",
};

const PIE_COLORS = [COLORS.correct, COLORS.wrong, COLORS.notAttempted];

const ChartCard = ({ title, children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 ${className}`}
  >
    <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
    {children}
  </div>
);

const EmptyChart = ({ text = "No data available" }) => (
  <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
    {text}
  </div>
);

// 1. Score Trend — Line Chart
const ScoreTrend = ({ data }) => {
  if (!data || data.length === 0)
    return <ChartCard title="Score Trend"><EmptyChart /></ChartCard>;

  return (
    <ChartCard title="Score Trend">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
          />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ r: 4, fill: COLORS.primary }}
            activeDot={{ r: 6 }}
            name="Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// 2. Accuracy Donut — Pie Chart
const AccuracyDonut = ({ data }) => {
  if (!data) return <ChartCard title="Accuracy"><EmptyChart /></ChartCard>;

  const pieData = [
    { name: "Correct", value: data.correct || 0 },
    { name: "Wrong", value: data.wrong || 0 },
    { name: "Not Attempted", value: data.notAttempted || 0 },
  ].filter((d) => d.value > 0);

  if (pieData.length === 0)
    return <ChartCard title="Accuracy"><EmptyChart /></ChartCard>;

  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard title="Accuracy">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PIE_COLORS[index % PIE_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} (${((value / total) * 100).toFixed(1)}%)`]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// 3. Subject-wise Performance — Grouped Bar Chart
const SubjectPerformance = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <ChartCard title="Subject-wise Performance">
        <EmptyChart />
      </ChartCard>
    );

  return (
    <ChartCard title="Subject-wise Performance">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="correct" fill={COLORS.correct} name="Correct" radius={[4, 4, 0, 0]} />
          <Bar dataKey="wrong" fill={COLORS.wrong} name="Wrong" radius={[4, 4, 0, 0]} />
          <Bar dataKey="notAttempted" fill={COLORS.notAttempted} name="Skipped" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// 4. Chapter-wise Accuracy — Horizontal Bar Chart
const ChapterAccuracy = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <ChartCard title="Chapter-wise Accuracy">
        <EmptyChart />
      </ChartCard>
    );

  return (
    <ChartCard title="Chapter-wise Accuracy">
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 32)}>
        <BarChart data={data} layout="vertical" barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="chapter"
            tick={{ fontSize: 11 }}
            stroke="#94a3b8"
            width={120}
          />
          <Tooltip
            formatter={(value) => [`${value}%`]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.accuracy >= 60 ? COLORS.correct : entry.accuracy >= 40 ? COLORS.accent : COLORS.wrong}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// 5. Quiz Attempts Timeline — Area Chart
const AttemptsTimeline = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <ChartCard title="Quiz Attempts Timeline">
        <EmptyChart />
      </ChartCard>
    );

  return (
    <ChartCard title="Quiz Attempts Timeline">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="attempts"
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#colorAttempts)"
            name="Quizzes Taken"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// 6. Score Distribution — Bar Chart (Histogram style)
const ScoreDistribution = ({ data }) => {
  if (!data || data.length === 0)
    return (
      <ChartCard title="Score Distribution">
        <EmptyChart />
      </ChartCard>
    );

  return (
    <ChartCard title="Score Distribution">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" fill={COLORS.primary} name="Quizzes" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// 7. Best vs Average vs Last — Radar Chart
const PerformanceComparison = ({ data }) => {
  if (!data)
    return (
      <ChartCard title="Performance Comparison">
        <EmptyChart />
      </ChartCard>
    );

  const radarData = [
    { metric: "Best Score", value: data.best || 0 },
    { metric: "Average", value: data.average || 0 },
    { metric: "Last Score", value: data.last || 0 },
  ];

  return (
    <ChartCard title="Performance Comparison">
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.25}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

// ---------------- MAIN COMPONENT ----------------
const QuizAnalyticsCharts = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-5">
      {/* Row 1: Score Trend + Accuracy Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ScoreTrend data={data.scoreTrend} />
        <AccuracyDonut data={data.summary} />
      </div>

      {/* Row 2: Subject Performance + Chapter Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SubjectPerformance data={data.subjectPerformance} />
        <ChapterAccuracy data={data.chapterPerformance} />
      </div>

      {/* Row 3: Attempts Timeline + Score Distribution + Performance Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <AttemptsTimeline data={data.monthlyAttempts} />
        <ScoreDistribution data={data.scoreDistribution} />
        <PerformanceComparison data={data.performanceComparison} />
      </div>
    </div>
  );
};

export default QuizAnalyticsCharts;
