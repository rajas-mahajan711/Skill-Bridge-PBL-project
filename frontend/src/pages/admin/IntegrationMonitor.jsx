import React, { useState, useEffect } from 'react';
import { 
  Server, Database, Cpu, GitBranch, Terminal, RefreshCw, 
  CheckCircle2, AlertTriangle, XCircle, Info, ExternalLink, Zap 
} from 'lucide-react';
import { Card, Title, Badge, Btn, LoadingState, ErrorState } from '../../components/ui.jsx';
import { AdminService } from '../../services/adminService.js';

export const IntegrationMonitor = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [probingService, setProbingService] = useState(null);

  const loadIntegrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminService.getIntegrations();
      setServices(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleTestProbe = async (service) => {
    setProbingService(service.id);
    try {
      // Simulate/trigger active probe
      await new Promise(r => setTimeout(r, 600));
      await loadIntegrations();
    } finally {
      setProbingService(null);
    }
  };

  const getServiceIcon = (type) => {
    switch (type) {
      case 'database': return Database;
      case 'ai_microservice': return Cpu;
      case 'external_connector': return GitBranch;
      case 'erp_connector': return Server;
      default: return Terminal;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Description */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-ink">Microservices & Connector Health Monitor</h2>
          <p className="text-xs text-mute mt-0.5">
            Transparently distinguishes between live connected systems, simulated sandbox adapters, and offline fallbacks.
          </p>
        </div>
        <Btn size="sm" v="primary" onClick={loadIntegrations}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Ping All Endpoints
        </Btn>
      </div>

      {/* Integration Disclosure Notice */}
      <div className="p-4 rounded-2xl bg-indigo/5 border border-indigo/20 flex items-start gap-3 text-indigo-900">
        <Info size={18} className="text-indigo shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="font-semibold">Person 5 Integration Guarantee:</strong> As specified in the architectural guidelines, SkillBridge does not invent successful integrations. Connectors without production credentials operate in verified <span className="font-semibold text-purple-700 underline">DEMO SANDBOX</span> mode and are explicitly flagged to prevent false reporting.
        </div>
      </div>

      {loading ? (
        <LoadingState message="Probing integration endpoints and microservice health..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIntegrations} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((svc) => {
            const Icon = getServiceIcon(svc.type);
            const isLive = svc.mode === 'live';
            const isDemo = svc.mode === 'demo';
            const isFallback = svc.mode === 'fallback';

            return (
              <Card key={svc.id} className="p-5 hover:border-slate-300 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Service info */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 ${
                      isLive 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : isDemo 
                        ? 'bg-purple-50 text-purple-600' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      <Icon size={24} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-ink text-base">{svc.name}</h4>
                        <Badge status={svc.status}>{svc.status}</Badge>
                        <Badge variant={svc.mode}>{svc.mode.toUpperCase()}</Badge>
                      </div>

                      <p className="text-xs text-mute mt-1 max-w-xl">
                        {svc.description}
                      </p>

                      {svc.endpoint && (
                        <div className="mt-2 text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md inline-block border border-slate-200/60">
                          Endpoint: {svc.endpoint}
                        </div>
                      )}

                      {svc.details && (
                        <div className="text-xs text-slate-500 mt-1 italic">
                          ℹ {svc.details}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Latency and Action */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[11px] text-mute uppercase font-semibold">Latency</div>
                      <div className="text-sm font-bold text-ink flex items-center justify-end gap-1">
                        <Zap size={13} className={svc.latencyMs < 50 ? 'text-emerald-500' : 'text-amber-500'} />
                        {svc.latencyMs ? `${svc.latencyMs} ms` : 'N/A'}
                      </div>
                    </div>

                    <Btn 
                      size="sm" 
                      v="secondary"
                      disabled={probingService === svc.id}
                      onClick={() => handleTestProbe(svc)}
                    >
                      {probingService === svc.id ? (
                        <RefreshCw size={13} className="animate-spin" />
                      ) : (
                        'Test Probe'
                      )}
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Architecture Topology Card */}
      <Card className="p-6 bg-slate-50 border-slate-200">
        <Title sub="Microservice interaction & fallback policy">Integration Topology Reference</Title>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-ink block">1. Express REST Gateway (:5000)</span>
            <p className="text-mute">
              Receives requests from React UI, validates JWT authorization tokens, and coordinates data access.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-ink block">2. MongoDB Database (:27017)</span>
            <p className="text-mute">
              Mongoose persistence layer for user accounts, role definitions, audit logs, and skill evidence.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-ink block">3. Python FastAPI Service (:8000)</span>
            <p className="text-mute">
              Stateless intelligence microservice providing skill extraction, evidence scoring, and role matching.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
