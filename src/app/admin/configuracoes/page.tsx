"use client";

import { useEffect, useState, useCallback } from "react";
import { FiSave, FiVolume2 } from "react-icons/fi";
import Button from "@/app/components/ui/Button";

interface SiteConfig {
  announcementEnabled: boolean;
  freeShippingMinValue: number;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<SiteConfig>({
    announcementEnabled: true,
    freeShippingMinValue: 299,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config/site");
      const data = await res.json();
      if (data.config) {
        setConfig({
          announcementEnabled: data.config.announcementEnabled,
          freeShippingMinValue: data.config.freeShippingMinValue,
        });
      }
    } catch {
      console.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/config/site", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar configurações");
        return;
      }

      setSuccess("Configurações salvas com sucesso!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">
          Gerencie as configurações gerais da loja
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Announcement Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <FiVolume2 className="text-pink-600" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Barra de Anúncio
            </h2>
            <p className="text-sm text-gray-500">
              A faixa de destaque exibida no topo da loja
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Exibir barra de anúncio</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Ativa ou desativa a barra no topo da loja
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={config.announcementEnabled}
              onClick={() =>
                setConfig({
                  ...config,
                  announcementEnabled: !config.announcementEnabled,
                })
              }
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                config.announcementEnabled ? "bg-pink-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  config.announcementEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Free Shipping Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Valor mínimo para Frete Grátis (R$)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={config.freeShippingMinValue}
              onChange={(e) =>
                setConfig({
                  ...config,
                  freeShippingMinValue: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full max-w-xs px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-400 mt-1.5">
              Exibido como: FRETE GRÁTIS acima de R${config.freeShippingMinValue}
            </p>
          </div>

          {/* Preview */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Pré-visualização
            </p>
            {config.announcementEnabled ? (
              <div className="bg-pink-600 text-white text-center text-xs py-1.5 font-medium tracking-wide rounded-lg">
                FRETE GRÁTIS acima de R$
                {config.freeShippingMinValue} | Parcele em até 4x sem
                juros
              </div>
            ) : (
              <div className="bg-gray-200 text-gray-500 text-center text-xs py-1.5 font-medium tracking-wide rounded-lg italic">
                Barra de anúncio desativada
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Button onClick={handleSave} disabled={saving}>
            <FiSave className="inline mr-2" size={16} />
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
