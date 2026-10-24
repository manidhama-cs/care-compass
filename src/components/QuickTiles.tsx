import React from 'react';
import { AppLanguage, I18N } from '../i18n/translations.ts';
import { Flame, Syringe, Droplets, Stethoscope, AlertOctagon } from 'lucide-react';

interface QuickTilesProps {
  language: AppLanguage;
  onSelectQuery: (query: string) => void;
  onEmergencyClick: () => void;
  onDoctorClick: () => void;
}

export const QuickTiles: React.FC<QuickTilesProps> = ({
  language,
  onSelectQuery,
  onEmergencyClick,
  onDoctorClick
}) => {
  const t = I18N[language];

  const tiles = [
    {
      id: 'fever',
      title: t.feverTile,
      subtitle: language === 'Hindi' ? "बुखार, खांसी या बीपी चेक" : language === 'Hinglish' ? "Bukhar, khansi ya vitals check" : "Fever, cough or BP/sugar checkup",
      icon: Flame,
      color: 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-200',
      iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50',
      action: () => onSelectQuery(
        language === 'Hindi'
          ? "पापा को दो दिन से बुखार और खांसी है, घर पर जांच चाहिए"
          : language === 'Hinglish'
          ? "papa ko do din se bukhar hai aur khansi bhi"
          : "My father has had fever and cough for 2 days"
      )
    },
    {
      id: 'injection',
      title: t.injectionTile,
      subtitle: language === 'Hindi' ? "घर पर सुई, ड्रिप या घाव की पट्टी" : language === 'Hinglish' ? "Ghar pe injection, IV drip ya dressing" : "IM/IV injection, wound dressing, catheter",
      icon: Syringe,
      color: 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-200',
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
      action: () => onSelectQuery(
        language === 'Hindi'
          ? "घर पर डॉक्टर का लिखा इंजेक्शन लगवाना है"
          : language === 'Hinglish'
          ? "doctor ne injection likha hai koi ghar aa sakta hai"
          : "Doctor prescribed an injection, can someone come home"
      )
    },
    {
      id: 'blood_test',
      title: t.bloodTestTile,
      subtitle: language === 'Hindi' ? "ब्लड शुगर, सीबीसी, थायराइड सैंपल" : language === 'Hinglish' ? "Blood sugar, CBC, thyroid test ghar se" : "Fasting blood sugar, CBC, thyroid tests",
      icon: Droplets,
      color: 'border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-950 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50',
      action: () => onSelectQuery(
        language === 'Hindi'
          ? "कल सुबह शुगर और सीबीसी टेस्ट घर से सैंपल लेना है"
          : language === 'Hinglish'
          ? "kal subah sugar test aur cbc ghar pe karwana hai"
          : "Need blood sugar test at home tomorrow morning"
      )
    },
    {
      id: 'doctor',
      title: t.doctorTile,
      subtitle: language === 'Hindi' ? "रिपोर्ट समीक्षा या सेकंड ओपिनियन" : language === 'Hinglish' ? "Reports check ya online doctor salah" : "Instant online video appointment (TinyFish)",
      icon: Stethoscope,
      color: 'border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-200',
      iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50',
      action: onDoctorClick
    },
    {
      id: 'emergency',
      title: t.emergencyTile,
      subtitle: language === 'Hindi' ? "सीने में तेज दर्द, सांस न आना, बेहोशी" : language === 'Hinglish' ? "Chest pain, saans nahi aana, behoshi" : "Chest pain, breathlessness, bleeding (112)",
      icon: AlertOctagon,
      color: 'border-red-300 bg-red-50 hover:bg-red-100 text-red-950 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200 col-span-1 sm:col-span-2 lg:col-span-1',
      iconColor: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/60',
      action: onEmergencyClick
    }
  ];

  return (
    <div className="w-full">
      <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
        {t.quickTilesTitle}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={tile.action}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all active:scale-[0.98] shadow-sm min-h-[72px] cursor-pointer ${tile.color}`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${tile.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-bold tracking-tight truncate">
                  {tile.title}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {tile.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
