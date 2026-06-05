import React, { useState, useEffect, useCallback } from 'react';
import { Users, GraduationCap, BookOpen, Library, BarChart3, PieChart as PieChartIcon, Trophy, Filter, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

// ==================== COLOR PALETTE ====================
const CHART_COLORS = ['#4d8eff', '#10B981', '#df7412', '#ffb4ab', '#a78bfa', '#f472b6', '#22d3ee', '#facc15'];
const PIE_COLORS = {
  'A':  '#10B981',
  'B+': '#22d3ee',
  'B':  '#4d8eff',
  'C+': '#a78bfa',
  'C':  '#f472b6',
  'D+': '#df7412',
  'D':  '#facc15',
  'F':  '#ffb4ab',
};

// ==================== CUSTOM TOOLTIP ====================
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-surface-hover rounded-xl px-4 py-3 shadow-xl">
      <p className="text-text-muted text-xs mb-1">Khoảng điểm</p>
      <p className="text-text-primary font-bold text-base">{label}</p>
      <p className="text-primary font-semibold text-sm mt-1">{payload[0].value.toLocaleString()} sinh viên</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-surface-hover rounded-xl px-4 py-3 shadow-xl">
      <p className="text-text-primary font-bold">{payload[0].name}</p>
      <p className="text-primary font-semibold">{payload[0].value.toLocaleString()} lượt</p>
      <p className="text-text-muted text-xs">{(payload[0].percent * 100).toFixed(1)}%</p>
    </div>
  );
};

const CustomGPATooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-surface-hover rounded-xl px-4 py-3 shadow-xl">
      <p className="text-text-primary font-bold">{label}</p>
      <p className="text-primary font-semibold">GPA: {payload[0].value}</p>
      {payload[0]?.payload?.tongSV && (
        <p className="text-text-muted text-xs">{payload[0].payload.tongSV} sinh viên</p>
      )}
    </div>
  );
};

// ==================== CUSTOM PIE LABEL ====================
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, diemChu }) => {
  if (percent < 0.03) return null; // Skip labels for slices too small
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {diemChu}
    </text>
  );
};

// ==================== STAT CARD ====================
function StatCard({ title, value, icon: Icon, iconColor, gradient }) {
  return (
    <div className={`relative overflow-hidden bg-surface rounded-2xl p-5 border border-surface-hover hover:border-primary/40 transition-all duration-300 group`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 ${gradient}`} />
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div>
          <p className="text-text-muted text-sm mb-1 font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary tracking-tight">{value?.toLocaleString() ?? '—'}</h3>
        </div>
        <div className={`p-2.5 rounded-xl bg-canvas border border-surface-hover ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ThongKe() {
  const [loading, setLoading] = useState(true);
  const [hocKyList, setHocKyList] = useState([]);
  const [selectedHK, setSelectedHK] = useState('');

  const [tongQuan, setTongQuan] = useState(null);
  const [phanBoDiem, setPhanBoDiem] = useState([]);
  const [xepLoai, setXepLoai] = useState([]);
  const [gpaKhoa, setGpaKhoa] = useState([]);
  const [topSV, setTopSV] = useState([]);

  // Fetch danh sách học kỳ
  useEffect(() => {
    axiosClient.get('/hocky')
      .then(res => {
        // axiosClient intercepts response.data => { status, total, data: [...] }
        const list = res?.data || [];
        setHocKyList(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Lỗi tải danh sách học kỳ'));
  }, []);

  // Fetch tất cả dữ liệu thống kê
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = selectedHK ? `?maHK=${selectedHK}` : '';
      const topParams = selectedHK ? `?maHK=${selectedHK}&limit=10` : '?limit=10';
      
      const [tongQuanRes, phanBoRes, xepLoaiRes, gpaRes, topRes] = await Promise.all([
        axiosClient.get('/thongke/tong-quan'),
        axiosClient.get(`/thongke/phan-bo-diem${params}`),
        axiosClient.get(`/thongke/xep-loai${params}`),
        axiosClient.get(`/thongke/gpa-theo-khoa${params}`),
        axiosClient.get(`/thongke/top-sinh-vien${topParams}`),
      ]);

      setTongQuan(tongQuanRes.data);
      setPhanBoDiem(phanBoRes.data);
      setXepLoai(xepLoaiRes.data);
      setGpaKhoa(gpaRes.data);
      setTopSV(topRes.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Lỗi tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  }, [selectedHK]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tổng điểm xếp loại
  const tongXepLoai = xepLoai.reduce((sum, item) => sum + item.soLuong, 0);

  return (
    <div className="max-w-[1400px] mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* ===== HEADER + FILTER ===== */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-text-muted text-sm mb-2 font-medium">Trang chủ &gt; Thống kê &amp; Báo cáo</div>
          <h2 className="text-3xl font-bold text-text-primary">Thống kê &amp; Báo cáo</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-surface-hover rounded-xl px-4 py-2.5">
            <Filter size={16} className="text-text-muted" />
            <select
              value={selectedHK}
              onChange={(e) => setSelectedHK(e.target.value)}
              className="bg-transparent text-text-primary text-sm font-medium outline-none cursor-pointer min-w-[180px]"
            >
              <option value="">Tất cả học kỳ</option>
              {hocKyList.map(hk => (
                <option key={hk.MaHK} value={hk.MaHK}>
                  {hk.TenHK} ({hk.NamBatDau}-{hk.NamKetThuc})
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 size={40} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* ===== STATS CARDS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            <StatCard
              title="Tổng Sinh viên"
              value={tongQuan?.tongSinhVien}
              icon={Users}
              iconColor="text-[#10B981]"
              gradient="bg-[#10B981]"
            />
            <StatCard
              title="Tổng Giảng viên"
              value={tongQuan?.tongGiangVien}
              icon={GraduationCap}
              iconColor="text-primary"
              gradient="bg-primary"
            />
            <StatCard
              title="Tổng Lớp học phần"
              value={tongQuan?.tongLopHocPhan}
              icon={BookOpen}
              iconColor="text-[#df7412]"
              gradient="bg-[#df7412]"
            />
            <StatCard
              title="Tổng Môn học"
              value={tongQuan?.tongMonHoc}
              icon={Library}
              iconColor="text-[#a78bfa]"
              gradient="bg-[#a78bfa]"
            />
          </div>

          {/* ===== CHARTS ROW 1: Bar + Pie ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Bar Chart - Phân bố điểm */}
            <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-surface-hover flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  Phân bố Điểm tổng kết
                </h3>
                <span className="text-xs text-text-muted bg-canvas px-3 py-1 rounded-full border border-surface-hover">
                  {phanBoDiem.reduce((s, d) => s + d.soLuong, 0).toLocaleString()} lượt chấm
                </span>
              </div>
              <div className="flex-1 min-h-[300px]">
                {phanBoDiem.some(d => d.soLuong > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={phanBoDiem} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#32353c" vertical={false} />
                      <XAxis dataKey="khoangDiem" tick={{ fill: '#c2c6d6', fontSize: 12 }} axisLine={{ stroke: '#32353c' }} tickLine={false} />
                      <YAxis tick={{ fill: '#c2c6d6', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(77, 142, 255, 0.08)' }} />
                      <Bar dataKey="soLuong" radius={[6, 6, 0, 0]} maxBarSize={50}>
                        {phanBoDiem.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-text-muted">
                    Không có dữ liệu điểm tổng kết
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart - Xếp loại */}
            <div className="lg:col-span-1 bg-surface rounded-2xl p-6 border border-surface-hover flex flex-col">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-6">
                <PieChartIcon size={20} className="text-[#10B981]" />
                Xếp loại học lực
              </h3>
              {tongXepLoai > 0 ? (
                <div className="flex-1 flex flex-col">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={xepLoai.filter(x => x.soLuong > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="soLuong"
                        nameKey="diemChu"
                        label={renderCustomLabel}
                        labelLine={false}
                      >
                        {xepLoai.filter(x => x.soLuong > 0).map((entry) => (
                          <Cell key={entry.diemChu} fill={PIE_COLORS[entry.diemChu] || '#888'} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                    {xepLoai.map(item => (
                      <div key={item.diemChu} className="flex items-center gap-2 text-sm">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PIE_COLORS[item.diemChu] || '#888' }}
                        />
                        <span className="text-text-muted">{item.diemChu}</span>
                        <span className="text-text-primary font-semibold ml-auto">{item.soLuong}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted">
                  Không có dữ liệu xếp loại
                </div>
              )}
            </div>
          </div>

          {/* ===== CHARTS ROW 2: GPA theo Khoa + Top SV ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* GPA theo Khoa - Horizontal Bar */}
            <div className="bg-surface rounded-2xl p-6 border border-surface-hover flex flex-col">
              <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-6">
                <BarChart3 size={20} className="text-[#a78bfa]" />
                GPA trung bình theo Khoa
              </h3>
              {gpaKhoa.length > 0 ? (
                <div className="flex-1 min-h-[280px]">
                  <ResponsiveContainer width="100%" height={Math.max(280, gpaKhoa.length * 55)}>
                    <BarChart data={gpaKhoa} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#32353c" horizontal={false} />
                      <XAxis type="number" domain={[0, 10]} tick={{ fill: '#c2c6d6', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="tenKhoa" tick={{ fill: '#c2c6d6', fontSize: 12 }} width={140} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomGPATooltip />} cursor={{ fill: 'rgba(77, 142, 255, 0.08)' }} />
                      <Bar dataKey="gpaAvg" radius={[0, 6, 6, 0]} maxBarSize={30}>
                        {gpaKhoa.map((_, index) => (
                          <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted min-h-[280px]">
                  Không có dữ liệu GPA
                </div>
              )}
            </div>

            {/* Top Sinh viên */}
            <div className="bg-surface rounded-2xl border border-surface-hover flex flex-col overflow-hidden">
              <div className="p-6 pb-0">
                <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
                  <Trophy size={20} className="text-[#facc15]" />
                  Top Sinh viên xuất sắc
                </h3>
              </div>
              {topSV.length > 0 ? (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-header border-b border-surface-hover text-text-muted text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold text-center w-16">#</th>
                        <th className="px-6 py-3 font-semibold">Sinh viên</th>
                        <th className="px-6 py-3 font-semibold">Lớp</th>
                        <th className="px-6 py-3 font-semibold text-center">GPA</th>
                        <th className="px-6 py-3 font-semibold text-center">Số môn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-hover">
                      {topSV.map((sv) => (
                        <tr key={sv.maSV} className="hover:bg-surface-hover/50 transition-colors group">
                          <td className="px-6 py-3 text-center">
                            {sv.hang <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                sv.hang === 1 ? 'bg-[#facc15]/20 text-[#facc15]' :
                                sv.hang === 2 ? 'bg-[#c0c0c0]/20 text-[#c0c0c0]' :
                                'bg-[#cd7f32]/20 text-[#cd7f32]'
                              }`}>
                                {sv.hang}
                              </span>
                            ) : (
                              <span className="text-text-muted font-medium">{sv.hang}</span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 flex-shrink-0">
                                {sv.hoTen?.charAt(sv.hoTen.lastIndexOf(' ') + 1) || '?'}
                              </div>
                              <div>
                                <div className="font-medium text-text-primary text-sm group-hover:text-primary transition-colors">{sv.hoTen}</div>
                                <div className="text-xs text-text-muted">{sv.maSV}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-text-muted text-sm">{sv.tenLop}</td>
                          <td className="px-6 py-3 text-center">
                            <span className="text-primary font-bold">{sv.gpaAvg}</span>
                          </td>
                          <td className="px-6 py-3 text-center text-text-muted text-sm">{sv.soMon}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-muted min-h-[280px]">
                  Không có dữ liệu sinh viên
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
