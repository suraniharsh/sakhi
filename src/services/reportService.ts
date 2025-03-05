import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { SymptomLog, DailySymptomSummary } from '../types/symptoms';
import { symptoms as masterSymptoms, moods as masterMoods } from '../data/masterData';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 20 },
  section: { marginBottom: 15 },
  heading: { fontSize: 18, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 150 },
  value: { flex: 1 },
});

interface SymptomReportProps {
  logs: SymptomLog[];
  summaries: DailySymptomSummary[];
  startDate: Date;
  endDate: Date;
}

const SymptomReport = ({ logs, summaries, startDate, endDate }: SymptomReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Symptom Report</Text>
      
      <View style={styles.section}>
        <Text style={styles.heading}>Report Period</Text>
        <View style={styles.row}>
          <Text style={styles.label}>From:</Text>
          <Text style={styles.value}>{startDate.toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>To:</Text>
          <Text style={styles.value}>{endDate.toLocaleDateString()}</Text>
        </View>
      </View>

      {summaries.map((summary, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.heading}>{new Date(summary.date).toLocaleDateString()}</Text>
          
          {summary.symptoms.map(symptomId => {
            const symptom = masterSymptoms.find(s => s.id === symptomId);
            return symptom ? (
              <View key={symptomId} style={styles.row}>
                <Text style={styles.label}>{symptom.name}:</Text>
                <Text style={styles.value}>Severity: {symptom.severity}</Text>
              </View>
            ) : null;
          })}

          {summary.moods.map(moodId => {
            const mood = masterMoods.find(m => m.id === moodId);
            return mood ? (
              <View key={moodId} style={styles.row}>
                <Text style={styles.label}>{mood.name}:</Text>
                <Text style={styles.value}>Intensity: {mood.intensity}</Text>
              </View>
            ) : null;
          })}

          {summary.notes && (
            <View style={styles.row}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.value}>{summary.notes}</Text>
            </View>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

export const ReportService = {
  generatePDF: (logs: SymptomLog[], summaries: DailySymptomSummary[], startDate: Date, endDate: Date) => {
    return (
      <PDFDownloadLink
        document={
          <SymptomReport
            logs={logs}
            summaries={summaries}
            startDate={startDate}
            endDate={endDate}
          />
        }
        fileName={`symptom-report-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.pdf`}
      >
        {({ loading }) => (loading ? 'Generating report...' : 'Download Report')}
      </PDFDownloadLink>
    );
  }
}; 