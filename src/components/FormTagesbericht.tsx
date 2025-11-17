import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form@7.55.0';
import { Download, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SignaturePad } from './SignaturePad';

interface ArbeitsItem {
  id: string;
  beschreibung: string;
  menge: string;
  einheit: string;
}

interface FormData {
  datum: string;
  wochentag: string;
  ort: string;
  strasseHausNr: string;
  auftraggeber: string;
  telNr: string;
  monteurArbeitszeit: string;
  artDerArbeit: string;
  kipperMontage: string;
  minibagger: string;
  radlader: string;
  bsAufgestelltAm: string;
  manRb810: string;
  neusson: string;
  sonstiges: string;
  container: string;
  atlas: string;
  materialBeschreibung: string;
  materialMenge: string;
}

interface FormTagesberichtProps {
  onSuccess?: () => void;
}

export function FormTagesbericht({ onSuccess }: FormTagesberichtProps) {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: {
      datum: '',
      wochentag: '',
      ort: '',
      strasseHausNr: '',
      auftraggeber: '',
      telNr: '',
      monteurArbeitszeit: '',
      artDerArbeit: '',
      kipperMontage: '',
      minibagger: '',
      radlader: '',
      bsAufgestelltAm: '',
      manRb810: '',
      neusson: '',
      sonstiges: '',
      container: '',
      atlas: '',
      materialBeschreibung: '',
      materialMenge: ''
    }
  });

  const [arbeitsItems, setArbeitsItems] = useState<ArbeitsItem[]>([
    { id: '1', beschreibung: '', menge: '', einheit: '' }
  ]);

  const [signatureKunde, setSignatureKunde] = useState<string>('');
  const [signatureMitarbeiter, setSignatureMitarbeiter] = useState<string>('');

  const addArbeitsItem = () => {
    setArbeitsItems([...arbeitsItems, {
      id: Date.now().toString(),
      beschreibung: '',
      menge: '',
      einheit: ''
    }]);
  };

  const removeArbeitsItem = (id: string) => {
    if (arbeitsItems.length > 1) {
      setArbeitsItems(arbeitsItems.filter(item => item.id !== id));
    }
  };

  const updateArbeitsItem = (id: string, field: keyof ArbeitsItem, value: string) => {
    setArbeitsItems(arbeitsItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const generatePDF = (data: FormData) => {
    // Validierung: Mindestens eine Arbeitsposition muss ausgefüllt sein
    const hasValidItem = arbeitsItems.some(item => item.beschreibung.trim() !== '');
    
    if (!hasValidItem && !data.artDerArbeit) {
      toast.error('Fehler', {
        description: 'Bitte fügen Sie mindestens eine Arbeitsposition oder Art der Arbeit hinzu.'
      });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rohrnetz Beil GmbH', 20, 20);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Luisenstr. 10', 20, 26);
    doc.text('02943 Weißwasser', 20, 31);
    doc.text('Tel.: 03576/283288', 20, 36);
    
    // Logo rechts
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ROHRNETZ', 190, 20, { align: 'right' });
    doc.setFontSize(10);
    doc.text('Beil', 190, 26, { align: 'right' });
    
    // Titel
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Tagesbericht', 105, 50, { align: 'center' });
    
    // Stammdaten
    let yPos = 65;
    doc.setFontSize(9);
    
    // Erste Zeile
    doc.setFont('helvetica', 'bold');
    doc.text('Datum:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.datum ? new Date(data.datum).toLocaleDateString('de-DE') : '—', 35, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Wochentag:', 80, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.wochentag || '—', 103, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Auftraggeber:', 140, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.auftraggeber || '—', 165, yPos);
    
    // Zweite Zeile
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Ort:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.ort || '—', 28, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Straße/Haus-Nr.:', 80, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.strasseHausNr || '—', 110, yPos);
    
    // Dritte Zeile
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Monteur/Arbeitszeit:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.monteurArbeitszeit || '—', 56, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Tel.Nr.:', 140, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.telNr || '—', 157, yPos);
    
    // Art der Arbeit
    if (data.artDerArbeit) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Art der Arbeit:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(data.artDerArbeit, 20, yPos + 5);
      yPos += 10;
    }
    
    // Arbeitsbezeichnung Tabelle
    if (hasValidItem) {
      yPos += 10;
      const arbeitsTableData = arbeitsItems
        .filter(item => item.beschreibung.trim() !== '')
        .map(item => [
          item.beschreibung,
          item.menge,
          item.einheit
        ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [['Beschreibung', 'Menge/Std.', 'Einheit']],
        body: arbeitsTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [226, 232, 240],
          textColor: [30, 41, 59],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [30, 41, 59]
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 }
        }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Geräte und Maschinen
    const geraeteItems = [];
    if (data.kipperMontage) geraeteItems.push(`Kipper/Montage: ${data.kipperMontage}`);
    if (data.minibagger) geraeteItems.push(`Minibagger: ${data.minibagger}`);
    if (data.radlader) geraeteItems.push(`Radlader: ${data.radlader}`);
    if (data.manRb810) geraeteItems.push(`MAN - RB 810: ${data.manRb810}`);
    if (data.neusson) geraeteItems.push(`Neusson: ${data.neusson}`);
    if (data.container) geraeteItems.push(`Container: ${data.container}`);
    if (data.atlas) geraeteItems.push(`Atlas: ${data.atlas}`);
    if (data.sonstiges) geraeteItems.push(`Sonstiges: ${data.sonstiges}`);
    
    if (geraeteItems.length > 0) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Geräte und Maschinen:', 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      geraeteItems.forEach(item => {
        doc.text(item, 20, yPos);
        yPos += 5;
      });
    }
    
    // BS aufgestellt am
    if (data.bsAufgestelltAm) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('BS aufgestellt am:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(data.bsAufgestelltAm, 20, yPos + 5);
      yPos += 10;
    }
    
    // Materialverbrauch
    if (data.materialBeschreibung || data.materialMenge) {
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Materialverbrauch und Maschinenstunden:', 20, yPos);
      yPos += 5;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Material: ${data.materialBeschreibung || '—'}`, 20, yPos);
      doc.text(`Menge: ${data.materialMenge || '—'}`, 120, yPos);
      yPos += 10;
    }
    
    // Unterschriften
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Unterschrift Kunde:', 20, yPos);
    
    if (signatureKunde) {
      doc.addImage(signatureKunde, 'PNG', 20, yPos + 2, 50, 15);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text('—', 20, yPos + 10);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Unterschrift Mitarbeiter:', 120, yPos);
    
    if (signatureMitarbeiter) {
      doc.addImage(signatureMitarbeiter, 'PNG', 120, yPos + 2, 50, 15);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text('—', 120, yPos + 10);
    }
    
    doc.save(`Tagesbericht_${data.datum || 'neu'}.pdf`);
    
    toast.success('PDF erfolgreich erstellt!', {
      description: 'Ihr Tagesbericht wurde heruntergeladen.',
      icon: <CheckCircle2 className="text-green-600" />
    });
  };

  const onSubmit = (data: FormData) => {
    generatePDF(data);
    if (onSuccess) {
      onSuccess();
    }
  };



  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-white dark:bg-slate-800 p-8 shadow-lg transition-colors">
      <h2 className="mb-6 text-blue-600 dark:text-blue-400">Tagesbericht</h2>

      {/* Kopfdaten */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              Datum <span className="text-red-500">*</span>
            </label>
            <Controller
              name="datum"
              control={control}
              rules={{ required: 'Datum ist erforderlich' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${
                    errors.datum
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
                  }`}
                />
              )}
            />
            {errors.datum && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.datum.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Wochentag</label>
            <Controller
              name="wochentag"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="z.B. Montag"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              Auftraggeber <span className="text-red-500">*</span>
            </label>
            <Controller
              name="auftraggeber"
              control={control}
              rules={{ required: 'Auftraggeber ist erforderlich' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${
                    errors.auftraggeber
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
                  }`}
                  placeholder="Name des Auftraggebers"
                />
              )}
            />
            {errors.auftraggeber && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.auftraggeber.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              Ort <span className="text-red-500">*</span>
            </label>
            <Controller
              name="ort"
              control={control}
              rules={{ required: 'Ort ist erforderlich' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${
                    errors.ort
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
                  }`}
                  placeholder="Ort"
                />
              )}
            />
            {errors.ort && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.ort.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Straße/Haus-Nr.</label>
            <Controller
              name="strasseHausNr"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Straße und Hausnummer"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Tel.Nr.</label>
            <Controller
              name="telNr"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Telefonnummer"
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-slate-700 dark:text-slate-300">Monteur/Arbeitszeit</label>
          <Controller
            name="monteurArbeitszeit"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                placeholder="z.B. Max Mustermann, 8:00 - 16:00"
              />
            )}
          />
        </div>

        <div>
          <label className="mb-1 block text-slate-700 dark:text-slate-300">Art der Arbeit</label>
          <Controller
            name="artDerArbeit"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                placeholder="Beschreibung der durchgeführten Arbeiten"
              />
            )}
          />
        </div>
      </div>

      {/* Geräte und Maschinen */}
      <div className="mb-8">
        <h3 className="mb-4 text-slate-800 dark:text-slate-300">Geräte und Maschinen</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Kipper/Montage</label>
            <Controller
              name="kipperMontage"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Kipper/Montage"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Minibagger</label>
            <Controller
              name="minibagger"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Minibagger"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Radlader</label>
            <Controller
              name="radlader"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Radlader"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">BS aufgestellt am</label>
            <Controller
              name="bsAufgestelltAm"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Datum der Aufstellung"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">MAN - RB 810</label>
            <Controller
              name="manRb810"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="MAN - RB 810"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Neusson</label>
            <Controller
              name="neusson"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Neusson"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Sonstiges</label>
            <Controller
              name="sonstiges"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Sonstige Geräte"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Container</label>
            <Controller
              name="container"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Container"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Atlas</label>
            <Controller
              name="atlas"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  placeholder="Atlas"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Arbeitsbezeichnung */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-slate-800 dark:text-slate-300">Arbeitsbezeichnung</h3>
          <button
            type="button"
            onClick={addArbeitsItem}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Position hinzufügen
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-700">
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">Beschreibung</th>
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">Menge/Std.</th>
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">Einheit</th>
                <th className="border border-slate-300 px-3 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {arbeitsItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.beschreibung}
                      onChange={(e) => updateArbeitsItem(item.id, 'beschreibung', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="Arbeitsbeschreibung"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.menge}
                      onChange={(e) => updateArbeitsItem(item.id, 'menge', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="Menge"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.einheit}
                      onChange={(e) => updateArbeitsItem(item.id, 'einheit', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="m, m³, Std."
                    />
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeArbeitsItem(item.id)}
                      disabled={arbeitsItems.length === 1}
                      className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Materialverbrauch und Maschinenstunden */}
      <div className="mb-8">
        <h3 className="mb-4 text-slate-800 dark:text-slate-300">Materialverbrauch und Maschinenstunden</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Material/Beschreibung</label>
              <Controller
                name="materialBeschreibung"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                    placeholder="Material"
                  />
                )}
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-700 dark:text-slate-300">Menge/Std.</label>
              <Controller
                name="materialMenge"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                    placeholder="Menge"
                  />
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unterschriften */}
      <div className="mb-8">
        <h3 className="mb-4 text-slate-800 dark:text-slate-300">Unterschriften</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SignaturePad
            label="Unterschrift Kunde"
            onSave={setSignatureKunde}
            value={signatureKunde}
          />
          <SignaturePad
            label="Unterschrift Mitarbeiter"
            onSave={setSignatureMitarbeiter}
            value={signatureMitarbeiter}
          />
        </div>
      </div>

      {/* PDF Generieren Button */}
      <div className="flex justify-end">
        <button 
          type="submit"
          className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white shadow-md hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          PDF Generieren
        </button>
      </div>
    </form>
  );
}