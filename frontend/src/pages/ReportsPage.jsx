import { useState, useEffect, useCallback } from 'react';
import { Download, FileText, Calendar, RefreshCw, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatters';
import { reportApi } from '../services/api/reportApi';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('all');
  
  // Form state for report generation
  const [formType, setFormType] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch reports from API
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportApi.getReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reportType === 'all' 
    ? reports 
    : reports.filter((r) => (r.type || '').toLowerCase() === reportType);

  const handleDownload = async (reportId) => {
    try {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return;
      
      toast.loading('Downloading...', { id: 'download' });
      const blob = await reportApi.downloadReport(reportId);
      const filename = (report.name || 'report').replace(/[^a-zA-Z0-9.-]/g, '_') + '.txt';
      reportApi.triggerDownload(blob, filename);
      toast.success('Download complete', { id: 'download' });
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report', { id: 'download' });
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      toast.loading('Generating report...', { id: 'generate' });
      
      const reportData = {
        type: formType,
        startDate: startDate || null,
        endDate: endDate || null,
        format: 'text',
      };
      
      const newReport = await reportApi.generateReport(reportData);
      setReports(prev => [newReport, ...prev]);
      toast.success('Report generated successfully', { id: 'generate' });
      
      // Reset form
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report', { id: 'generate' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (reportId) => {
    try {
      await reportApi.deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
      toast.success('Report deleted');
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleExportCsv = async () => {
    try {
      toast.loading('Exporting data...', { id: 'export' });
      const blob = await reportApi.exportData({
        type: formType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      const filename = `energy_export_${new Date().toISOString().split('T')[0]}.csv`;
      reportApi.triggerDownload(blob, filename);
      toast.success('Export complete', { id: 'export' });
    } catch (error) {
      console.error('Failed to export:', error);
      toast.error('Failed to export data', { id: 'export' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and download energy reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={fetchReports} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="primary" className="flex gap-2" onClick={handleExportCsv}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Builder */}
      <Card title="Create Custom Report">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select 
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="device">Device</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:text-white text-sm"
            />
          </div>

          <div className="flex items-end">
            <Button 
              variant="primary" 
              size="md" 
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? <RefreshCw size={18} className="animate-spin" /> : <FileText size={18} />}
              Generate
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'monthly', 'quarterly', 'annual', 'device'].map((type) => (
          <Button
            key={type}
            variant={reportType === type ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setReportType(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="animate-spin text-primary-500" size={32} />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReports.map((report) => (
            <Card key={report.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-300">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{report.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Generated {formatDate(report.generatedAt || report.generated)}
                    </span>
                    <span>{report.size}</span>
                    {report.status && (
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        report.status === 'completed' 
                          ? 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-300'
                          : report.status === 'pending'
                          ? 'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-300'
                          : 'bg-danger-100 text-danger-700 dark:bg-danger-800 dark:text-danger-300'
                      }`}>
                        {report.status}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(report.id)}
                    className="flex gap-1"
                    title="Download"
                  >
                    <Download size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report.id)}
                    className="text-danger-600 dark:text-danger-400"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredReports.length === 0 && !loading && (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No reports found</p>
        </Card>
      )}

      {/* Report Templates */}
      <Card title="Report Templates">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: 'Executive Summary', desc: 'High-level energy overview', type: 'monthly' },
            { name: 'Detailed Analysis', desc: 'In-depth consumption analysis', type: 'quarterly' },
            { name: 'Cost Breakdown', desc: 'Detailed cost analysis', type: 'annual' },
            { name: 'Device Report', desc: 'Individual device performance', type: 'device' },
          ].map((template, idx) => (
            <div
              key={idx}
              onClick={() => {
                setFormType(template.type);
                toast(`Template selected: ${template.name}`, { icon: '📋' });
              }}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition"
            >
              <p className="font-medium text-gray-900 dark:text-white">{template.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{template.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
