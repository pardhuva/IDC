import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { FiBarChart2, FiCpu, FiSearch, FiSmile, FiTrendingUp, FiFileText, FiActivity } from 'react-icons/fi'

const SECTIONS = [
  {
    id: 'intent',
    title: 'Intent Classification',
    icon: FiCpu,
    color: '#003580',
    charts: ['1_intent_confusion_matrix.png', '1_intent_per_class_metrics.png', '1_intent_top_features.png'],
    metricKey: 'intent_classification_report',
    highlights: [
      { label: 'Algorithm', value: 'TF-IDF + Logistic Regression' },
      { label: 'Dataset', value: '200 samples, 10 classes' },
      { label: '5-Fold CV Accuracy', value: '79.5%', accent: true },
      { label: 'Best Class (F1)', value: 'guide_assignment (0.95)' },
    ],
  },
  {
    id: 'search',
    title: 'Semantic Search',
    icon: FiSearch,
    color: '#FF671F',
    charts: ['2_semantic_retrieval_accuracy.png', '2_semantic_tsne_embeddings.png'],
    metricKey: 'semantic_search_evaluation',
    highlights: [
      { label: 'Model', value: 'all-MiniLM-L6-v2 (22M params)' },
      { label: 'Embedding Dim', value: '384' },
      { label: 'Hit@3 Accuracy', value: '75.0%', accent: true },
      { label: 'Corpus', value: '48 documents (4 types)' },
    ],
  },
  {
    id: 'sentiment',
    title: 'Sentiment Analysis',
    icon: FiSmile,
    color: '#38a169',
    charts: ['3_sentiment_accuracy.png', '3_sentiment_polarity_distribution.png'],
    metricKey: 'sentiment_analysis_evaluation',
    highlights: [
      { label: 'Model', value: 'TextBlob (Rule-based NLP)' },
      { label: 'Exact Match', value: '60.0%' },
      { label: 'Adjacent Accuracy', value: '93.3%', accent: true },
      { label: 'Mood Categories', value: '5 classes' },
    ],
  },
  {
    id: 'performance',
    title: 'Performance Scoring',
    icon: FiActivity,
    color: '#d69e2e',
    charts: ['4_performance_scoring_weights.png', '4_performance_grade_distribution.png'],
    metricKey: null,
    highlights: [
      { label: 'Algorithm', value: 'Weighted Multi-Factor (0-100)' },
      { label: 'Factors', value: '5 weighted components' },
      { label: 'Top Weight', value: 'Task Completion (30%)' },
      { label: 'Grades', value: 'A / B / C / D / F' },
    ],
  },
  {
    id: 'workload',
    title: 'Workload Prediction',
    icon: FiTrendingUp,
    color: '#e53e3e',
    charts: ['5_workload_feature_importance.png', '5_workload_probability_curve.png'],
    metricKey: 'workload_predictor_evaluation',
    highlights: [
      { label: 'Algorithm', value: 'Logistic Regression' },
      { label: 'Features', value: '6 engineered features' },
      { label: 'Training Data', value: '8 anchor points' },
      { label: 'Thresholds', value: 'On Track/At Risk/Behind' },
    ],
  },
  {
    id: 'summarizer',
    title: 'TF-IDF Summarizer',
    icon: FiFileText,
    color: '#805ad5',
    charts: ['6_tfidf_sentence_ranking.png', '6_tfidf_keywords.png'],
    metricKey: 'tfidf_summarizer_example',
    highlights: [
      { label: 'Algorithm', value: 'TF-IDF Extractive' },
      { label: 'Method', value: 'Centroid-based sentence scoring' },
      { label: 'Output', value: 'Top-N sentences + keywords' },
      { label: 'Use Case', value: 'Auto diary-to-report' },
    ],
  },
  {
    id: 'comparison',
    title: 'Model Comparison & Architecture',
    icon: FiBarChart2,
    color: '#002147',
    charts: ['7_model_comparison_table.png', '7_system_architecture.png'],
    metricKey: null,
    highlights: [
      { label: 'Total AI/ML Features', value: '9', accent: true },
      { label: 'Algorithms Used', value: '5 distinct' },
      { label: 'ML Libraries', value: 'scikit-learn, FAISS, TextBlob' },
      { label: 'DL Model', value: 'Sentence-Transformers' },
    ],
  },
]

const BASE_URL = 'http://localhost:8000'

export default function MLEvaluation() {
  const [metrics, setMetrics] = useState({})
  const [charts, setCharts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('intent')
  const [expandedMetric, setExpandedMetric] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    api.get('/api/ml-metrics')
      .then(({ data }) => {
        setMetrics(data.metrics || {})
        setCharts(data.charts || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const section = SECTIONS.find(s => s.id === activeSection)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #002147 0%, #003580 50%, #FF671F 100%)',
        borderRadius: 16, padding: '32px 40px', marginBottom: 28, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <FiBarChart2 size={28} />
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>ML Model Evaluation</h1>
        </div>
        <p style={{ margin: 0, opacity: 0.9, fontSize: 15 }}>
          Cross-validation metrics, confusion matrices, t-SNE embeddings, and feature importance analysis for all 6 AI/ML modules
        </p>
        <div style={{ display: 'flex', gap: 24, marginTop: 18, flexWrap: 'wrap' }}>
          {[
            { l: 'Models', v: '6' }, { l: 'Charts', v: '15' },
            { l: 'Best Accuracy', v: '93.3%' }, { l: 'Algorithms', v: '5' },
          ].map(s => (
            <div key={s.l} style={{
              background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 18px',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.v}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap',
      }}>
        {SECTIONS.map(s => {
          const Icon = s.icon
          const active = activeSection === s.id
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              border: active ? `2px solid ${s.color}` : '2px solid #e2e8f0',
              borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? s.color : '#fff', color: active ? '#fff' : '#4a5568',
              transition: 'all 0.2s',
            }}>
              <Icon size={15} /> {s.title}
            </button>
          )
        })}
      </div>

      {/* Active Section */}
      {section && (
        <div style={{
          border: `2px solid ${section.color}20`, borderRadius: 16, overflow: 'hidden',
          marginBottom: 28,
        }}>
          {/* Section Header */}
          <div style={{
            background: section.color, color: '#fff', padding: '18px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <section.icon size={22} />
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{section.title}</h2>
          </div>

          {/* Highlight Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12, padding: 20, background: '#f7fafc',
          }}>
            {section.highlights.map(h => (
              <div key={h.label} style={{
                background: '#fff', borderRadius: 10, padding: '14px 16px',
                border: h.accent ? `2px solid ${section.color}` : '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>{h.label}</div>
                <div style={{
                  fontSize: h.accent ? 22 : 15, fontWeight: h.accent ? 800 : 600,
                  color: h.accent ? section.color : '#2d3748', marginTop: 4,
                }}>{h.value}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#2d3748' }}>Evaluation Charts</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: section.charts.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: 16,
            }}>
              {section.charts.map(chart => (
                <div key={chart} style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: 12, cursor: 'pointer', transition: 'box-shadow 0.2s',
                }}
                onClick={() => setLightbox(`${BASE_URL}/charts/${chart}`)}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <img
                    src={`${BASE_URL}/charts/${chart}`}
                    alt={chart.replace(/_/g, ' ').replace('.png', '')}
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                  <div style={{
                    fontSize: 12, color: '#718096', textAlign: 'center', marginTop: 8,
                    fontWeight: 500,
                  }}>
                    {chart.replace(/^\d+_/, '').replace(/_/g, ' ').replace('.png', '').replace(/\b\w/g, c => c.toUpperCase())}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Metrics */}
          {section.metricKey && metrics[section.metricKey] && (
            <div style={{ padding: '0 20px 20px' }}>
              <button onClick={() => setExpandedMetric(expandedMetric === section.id ? null : section.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
                background: expandedMetric === section.id ? '#f7fafc' : '#fff', fontSize: 13, fontWeight: 600,
                color: '#4a5568', width: '100%',
              }}>
                <FiFileText size={14} />
                {expandedMetric === section.id ? 'Hide' : 'Show'} Raw Evaluation Report
              </button>
              {expandedMetric === section.id && (
                <pre style={{
                  background: '#1a202c', color: '#e2e8f0', padding: 20, borderRadius: 10,
                  fontSize: 12, lineHeight: 1.6, overflow: 'auto', maxHeight: 500,
                  marginTop: 10, fontFamily: '"Fira Code", "Consolas", monospace',
                }}>
                  {metrics[section.metricKey]}
                </pre>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'zoom-out', padding: 40,
        }}>
          <img src={lightbox} alt="Chart" style={{
            maxWidth: '90%', maxHeight: '90%', borderRadius: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }} />
        </div>
      )}
    </div>
  )
}
