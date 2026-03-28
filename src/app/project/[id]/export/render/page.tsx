import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

const STEP_NAMES = [
  '組圈', '主題選定', '活動計畫', '現況把握', '目標設定',
  '解析', '對策擬定', '對策實施', '效果確認', '標準化',
]

function Field({ label, value }: { label: string; value: unknown }) {
  const display = value != null && value !== '' ? String(value) : '（待補充）'
  const isEmpty = value == null || value === ''
  return (
    <div className="mb-2">
      <span className="text-sm font-medium text-gray-700">{label}：</span>
      <span className={`text-sm ${isEmpty ? 'text-blue-400 italic' : 'text-gray-900'}`}>
        {display}
      </span>
    </div>
  )
}

export default async function ExportRenderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members: { orderBy: { createdAt: 'asc' } },
      steps: { orderBy: { stepNumber: 'asc' } },
    },
  })

  if (!project) notFound()

  // Load system settings for header/footer
  const settings = await prisma.systemSetting.findMany()
  const settingMap = new Map(settings.map((s) => [s.key, s.value]))
  const hospitalName = settingMap.get('hospital_name') || ''

  // Build step data map
  const stepDataMap = new Map<number, Record<string, unknown>>()
  for (const step of project.steps) {
    stepDataMap.set(step.stepNumber, (step.data as Record<string, unknown>) || {})
  }

  return (
    <div className="mx-auto max-w-[210mm] bg-white p-8 text-gray-900" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
      {/* Cover */}
      <div className="mb-12 text-center">
        {hospitalName && <p className="mb-2 text-sm text-gray-500">{hospitalName}</p>}
        <h1 className="text-2xl font-bold">品管圈活動報告</h1>
        <h2 className="mt-2 text-lg text-gray-700">{project.name}</h2>
        <p className="mt-1 text-sm text-gray-500">
          {project.circleName} · {project.department}
        </p>
        {project.periodStart && project.periodEnd && (
          <p className="mt-1 text-sm text-gray-500">
            活動期間：{new Date(project.periodStart).toLocaleDateString('zh-TW')} ~{' '}
            {new Date(project.periodEnd).toLocaleDateString('zh-TW')}
          </p>
        )}
      </div>

      {/* Steps */}
      {STEP_NAMES.map((name, i) => {
        const n = i + 1
        const data = stepDataMap.get(n) || {}
        return (
          <section key={n} className="mb-8 break-inside-avoid">
            <h3 className="mb-3 border-b-2 border-blue-600 pb-1 text-lg font-bold text-blue-800">
              步驟 {n}：{name}
            </h3>
            <StepContent stepNumber={n} data={data} />
          </section>
        )
      })}

      {/* KPI Summary */}
      <section className="mb-8 break-inside-avoid">
        <h3 className="mb-3 border-b-2 border-blue-600 pb-1 text-lg font-bold text-blue-800">
          KPI 摘要
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">現狀值</p>
            <p className="text-lg font-bold">{project.currentRate != null ? `${project.currentRate}%` : '（待補充）'}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">目標值</p>
            <p className="text-lg font-bold">{project.targetRate != null ? `${project.targetRate}%` : '（待補充）'}</p>
          </div>
          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">改善後</p>
            <p className="text-lg font-bold">{project.postRate != null ? `${project.postRate}%` : '（待補充）'}</p>
          </div>
        </div>
        {project.improvementRate != null && (
          <p className="mt-2 text-center text-sm">
            改善幅度：<strong>{String(project.improvementRate)}%</strong>
            {project.goalAchievementRate != null && (
              <> · 目標達成率：<strong>{String(project.goalAchievementRate)}%</strong></>
            )}
          </p>
        )}
      </section>

      {/* Ready marker for Browserless */}
      <div id="report-ready" />
    </div>
  )
}

function StepContent({ stepNumber, data }: { stepNumber: number; data: Record<string, unknown> }) {
  switch (stepNumber) {
    case 1:
      return (
        <div>
          <Field label="圈名" value={data.circle_name} />
          <Field label="圈的意義" value={data.circle_meaning} />
          <Field label="科別" value={data.department} />
          {data.leader != null && typeof data.leader === 'object' ? (
            <Field label="圈長" value={`${(data.leader as Record<string, string>).name || ''} ${(data.leader as Record<string, string>).title || ''}`} />
          ) : null}
          {data.advisor != null && typeof data.advisor === 'object' ? (
            <Field label="輔導員" value={`${(data.advisor as Record<string, string>).name || ''} ${(data.advisor as Record<string, string>).title || ''}`} />
          ) : null}
          {Array.isArray(data.members) && data.members.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">圈員：</p>
              <ul className="ml-4 list-disc text-sm">
                {(data.members as Array<{ name: string; title: string; division: string }>).map((m, i) => (
                  <li key={i}>{m.name}（{m.title}）— {m.division}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    case 2:
      return (
        <div>
          <Field label="選定主題" value={data.selected_topic} />
          <Field label="選題理由" value={data.selection_reason} />
          <Field label="衡量指標" value={data.metric_definition} />
        </div>
      )
    case 3:
      return (
        <div>
          <Field label="預計週數" value={data.total_weeks} />
          <Field label="開會頻率" value={data.meeting_frequency} />
        </div>
      )
    case 4:
      return (
        <div>
          <Field label="查檢總數" value={data.total_checks} />
          <Field label="現狀值" value={data.current_rate != null ? `${data.current_rate}%` : null} />
          <Field label="現況描述" value={data.description} />
          {Array.isArray(data.vital_few) && data.vital_few.length > 0 && (
            <Field label="關鍵少數" value={(data.vital_few as string[]).join('、')} />
          )}
        </div>
      )
    case 5:
      return (
        <div>
          <Field label="現狀值" value={data.current_value} />
          <Field label="目標值" value={data.target_value} />
          <Field label="計算方式" value={data.calculation_method === 'formula' ? '公式計算' : '手動輸入'} />
          <Field label="設定理由" value={data.reason} />
        </div>
      )
    case 6:
      return (
        <div>
          <Field label="魚骨圖主題" value={data.fishbone_topic} />
          {Array.isArray(data.confirmed_root_causes) && (
            <Field label="確認真因數" value={`${(data.confirmed_root_causes as string[]).length} 項`} />
          )}
        </div>
      )
    case 7: {
      const cms = Array.isArray(data.countermeasures) ? data.countermeasures : []
      const adopted = Array.isArray(data.adopted) ? data.adopted : []
      return (
        <div>
          <Field label="對策總數" value={`${cms.length} 項`} />
          <Field label="採行數" value={`${adopted.length} 項`} />
          {cms.filter((cm: { id: string }) => adopted.includes(cm.id)).map((cm: { what: string; who: string; when: string }, i: number) => (
            <div key={i} className="ml-2 mt-1 border-l-2 border-gray-200 pl-3 text-sm">
              <p className="font-medium">{cm.what || '（待補充）'}</p>
              <p className="text-gray-500">負責人：{cm.who || '—'} · 預計完成：{cm.when || '—'}</p>
            </div>
          ))}
        </div>
      )
    }
    case 8: {
      const impls = Array.isArray(data.implementations) ? data.implementations : []
      return (
        <div>
          <Field label="實施項目數" value={`${impls.length} 項`} />
          {impls.map((impl: { countermeasure_name: string; status: string; effectiveness: string | null }, i: number) => (
            <div key={i} className="ml-2 mt-1 text-sm">
              <span className="font-medium">{impl.countermeasure_name || '（未命名）'}</span>
              <span className="ml-2 text-gray-500">
                {impl.status === 'completed' ? '已完成' : impl.status === 'delayed' ? '延遲' : '進行中'}
                {impl.effectiveness && ` · ${impl.effectiveness === 'effective' ? '有效' : impl.effectiveness === 'ineffective' ? '無效' : '需修正'}`}
              </span>
            </div>
          ))}
        </div>
      )
    }
    case 9:
      return (
        <div>
          <Field label="改善後不良率" value={data.post_rate != null ? `${data.post_rate}%` : null} />
          <Field label="改善幅度" value={data.improvement_rate != null ? `${data.improvement_rate}%` : null} />
          <Field label="目標達成率" value={data.goal_achievement_rate != null ? `${data.goal_achievement_rate}%` : null} />
        </div>
      )
    case 10: {
      const review = data.review as Record<string, string> | undefined
      return (
        <div>
          {Array.isArray(data.standardizations) && (
            <Field label="標準化項目數" value={`${(data.standardizations as unknown[]).length} 項`} />
          )}
          <Field label="優點" value={review?.strengths} />
          <Field label="待改進" value={review?.improvements} />
          <Field label="下期建議" value={review?.next_topic_suggestion} />
          <Field label="預估效益" value={data.benefit_summary} />
        </div>
      )
    }
    default:
      return <p className="text-sm text-gray-400">（無資料）</p>
  }
}
