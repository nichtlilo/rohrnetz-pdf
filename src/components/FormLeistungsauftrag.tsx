import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form@7.55.0';
import { Download, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SignaturePad } from './SignaturePad';
import { ProgressModal } from './ProgressModal';
import { FloatingActionButton } from './FloatingActionButton';

interface LeistungsItem {
  id: string;
  beschreibung: string;
  einheitNetto: string;
  stundenStuck: string;
  m3m: string;
  km: string;
  bemerkung: string;
}

interface FormData {
  einsatzort: string;
  rgEmpfaenger: string;
  artDerArbeit: string;
  datum: string;
  monteur: string;
  telefonNr: string;
  unterschriftKunde: string;
  blockschrift: string;
  sonstiges: string;
}

interface FormLeistungsauftragProps {
  onSuccess?: () => void;
}

export function FormLeistungsauftrag({ onSuccess }: FormLeistungsauftragProps) {
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
    defaultValues: {
      einsatzort: '',
      rgEmpfaenger: '',
      artDerArbeit: '',
      datum: '',
      monteur: '',
      telefonNr: '',
      unterschriftKunde: '',
      blockschrift: '',
      sonstiges: ''
    }
  });

  const [items, setItems] = useState<LeistungsItem[]>([
    { id: '1', beschreibung: '', einheitNetto: '', stundenStuck: '', m3m: '', km: '', bemerkung: '' }
  ]);

  const [signatureKunde, setSignatureKunde] = useState<string>('');
  const [signatureMitarbeiter, setSignatureMitarbeiter] = useState<string>('');

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      beschreibung: '',
      einheitNetto: '',
      stundenStuck: '',
      m3m: '',
      km: '',
      bemerkung: ''
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LeistungsItem, value: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const generatePDF = (data: FormData) => {
    // Validierung: Mindestens eine Position muss ausgefüllt sein
    const hasValidItem = items.some(item => item.beschreibung.trim() !== '');
    
    if (!hasValidItem) {
      toast.error('Fehler', {
        description: 'Bitte fügen Sie mindestens eine Leistungsposition hinzu.'
      });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ROHRNETZ Beil GmbH', 20, 20);
    
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
    doc.text('Leistungsauftrag', 105, 50, { align: 'center' });
    
    // Stammdaten
    let yPos = 65;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Einsatzort:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.einsatzort || '—', 50, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Datum:', 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.datum ? new Date(data.datum).toLocaleDateString('de-DE') : '—', 140, yPos);
    
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('RG – Empfänger:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.rgEmpfaenger || '—', 20, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'bold');
    doc.text('Art der Arbeit:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.artDerArbeit || '—', 20, yPos + 5);
    
    // Leistungen Tabelle
    yPos += 15;
    const tableData = items
      .filter(item => item.beschreibung.trim() !== '')
      .map(item => [
        item.beschreibung,
        item.einheitNetto,
        item.stundenStuck,
        item.m3m,
        item.km,
        item.bemerkung
      ]);
    
    autoTable(doc, {
      startY: yPos,
      head: [['Beschreibung', 'Einheit/Netto', 'Std./Stück', 'm³/m', 'km', 'Bemerkung']],
      body: tableData,
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
        0: { cellWidth: 40 },
        1: { cellWidth: 25 },
        2: { cellWidth: 22 },
        3: { cellWidth: 20 },
        4: { cellWidth: 15 },
        5: { cellWidth: 'auto' }
      }
    });
    
    // Position nach Tabelle
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Zusätzliche Informationen
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Monteur:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.monteur || '—', 20, yPos + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Telefon Nr.:', 80, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.telefonNr || '—', 80, yPos + 5);
    
    yPos += 13;
    doc.setFont('helvetica', 'bold');
    doc.text('Blockschrift:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.blockschrift || '—', 20, yPos + 5);
    
    // Unterschriften
    yPos += 15;
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
    
    yPos += 20;
    
    if (data.sonstiges) {
      yPos += 13;
      doc.setFont('helvetica', 'bold');
      doc.text('Sonstiges:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(data.sonstiges, 170);
      doc.text(splitText, 20, yPos + 5);
    }
    
    doc.save(`Leistungsauftrag_${data.datum || 'neu'}.pdf`);
    
    toast.success('PDF erfolgreich erstellt!', {
      description: 'Ihr Leistungsauftrag wurde heruntergeladen.',
      icon: <CheckCircle2 className="text-green-600" />
    });
    
    // Trigger confetti effect
    if (onSuccess) {
      onSuccess();
    }
  };

  const onSubmit = (data: FormData) => {
    generatePDF(data);
  };

  // Auto-save effect


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl bg-white dark:bg-slate-800 p-8 shadow-lg transition-colors">
      <h2 className="mb-6 text-blue-600 dark:text-blue-400">Leistungsauftrag</h2>

      {/* Allgemeine Informationen */}
      <div className="mb-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              Einsatzort <span className="text-red-500">*</span>
            </label>
            <Controller
              name="einsatzort"
              control={control}
              rules={{ required: 'Einsatzort ist erforderlich' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${
                    errors.einsatzort
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
                  }`}
                  placeholder="Einsatzort eingeben"
                />
              )}
            />
            {errors.einsatzort && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.einsatzort.message}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">
              RG – Empfänger <span className="text-red-500">*</span>
            </label>
            <Controller
              name="rgEmpfaenger"
              control={control}
              rules={{ required: 'Rechnungsempfänger ist erforderlich' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${
                    errors.rgEmpfaenger
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                      : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
                  }`}
                  placeholder="Rechnungsempfänger"
                />
              )}
            />
            {errors.rgEmpfaenger && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.rgEmpfaenger.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-slate-700 dark:text-slate-300">
            Art der Arbeit <span className="text-red-500">*</span>
          </label>
          <Controller
            name="artDerArbeit"
            control={control}
            rules={{ required: 'Art der Arbeit ist erforderlich' }}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors ${
                  errors.artDerArbeit
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900'
                    : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900'
                }`}
                placeholder="Beschreibung der Arbeit"
              />
            )}
          />
          {errors.artDerArbeit && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle size={14} />
              {errors.artDerArbeit.message}
            </p>
          )}
        </div>
      </div>

      {/* Leistungen Tabelle */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-slate-800 dark:text-slate-200">Leistungen</h3>
          <button
            type="button"
            onClick={addItem}
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
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">Einheit/Netto</th>
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">Stunden/Stück</th>
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">m³/m</th>
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">km</th>
                <th className="border border-slate-300 px-3 py-2 text-left text-slate-700 dark:text-slate-300">Bemerkung</th>
                <th className="border border-slate-300 px-3 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-600">
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.beschreibung}
                      onChange={(e) => updateItem(item.id, 'beschreibung', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="z.B. Betriebsstundeneinsatz"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.einheitNetto}
                      onChange={(e) => updateItem(item.id, 'einheitNetto', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="€"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.stundenStuck}
                      onChange={(e) => updateItem(item.id, 'stundenStuck', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.m3m}
                      onChange={(e) => updateItem(item.id, 'm3m', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.km}
                      onChange={(e) => updateItem(item.id, 'km', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </td>
                  <td className="border border-slate-300 p-2">
                    <input
                      type="text"
                      value={item.bemerkung}
                      onChange={(e) => updateItem(item.id, 'bemerkung', e.target.value)}
                      className="w-full border-0 bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300"
                    />
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
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

      {/* Zusätzliche Felder */}
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
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Monteur</label>
            <Controller
              name="monteur"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Name des Monteurs"
                />
              )}
            />
          </div>
          <div>
            <label className="mb-1 block text-slate-700 dark:text-slate-300">Telefon Nr.</label>
            <Controller
              name="telefonNr"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="tel"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Telefonnummer"
                />
              )}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-slate-700 dark:text-slate-300">Blockschrift</label>
          <Controller
            name="blockschrift"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Name in Blockschrift"
              />
            )}
          />
        </div>

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

        <div>
          <label className="mb-1 block text-slate-700 dark:text-slate-300">Sonstiges</label>
          <Controller
            name="sonstiges"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                rows={4}
                placeholder="Weitere Bemerkungen..."
              />
            )}
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