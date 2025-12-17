'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { Shield, Building, Database, Target, Share, Cookie, Archive, Users, Lock, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('privacyPolicy')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('privacy.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-700 border border-primary-200 font-montserrat font-medium">{translate('privacy.badge')}</div>
              <div className="flex items-center gap-2 mb-3">
                <Building className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.responsibleTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Verantwortliche Stelle für die Datenbearbeitung im Rahmen der Plattform Feinraumshop ist die Feinraumshop AG, Arbon, Schweiz. Als Betreiberin der Plattform bestimmt Feinraumshop die Zwecke und Mittel der Datenbearbeitung und stellt sicher, dass die datenschutzrechtlichen Anforderungen eingehalten werden.
                </p>
                <p>
                  Für die Datenbearbeitung im Zusammenhang mit der Abwicklung von Kaufverträgen und der Bereitstellung von Produkten sind die jeweiligen Lieferanten eigenständig verantwortlich. Feinraumshop ist jedoch für die technischen und organisatorischen Massnahmen im Rahmen der Plattform sowie für die Transparenz und die Wahrnehmung von Betroffenenrechte verantwortlich.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.dataTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Wir bearbeiten Personendaten, die im Rahmen der Nutzung der Plattform und der Abwicklung von Bestellungen anfallen. Dies umfasst insbesondere Stammdaten (Name, Adresse, Kontaktinformationen), Vertragsdaten (Bestellungen, Rechnungen, Lieferinformationen), Kommunikationsdaten (E-Mail-Verkehr, Anfragen), Nutzungsdaten (Zugriffszeiten, IP-Adressen, Gerätinformationen) sowie Zahlungsdaten (sofern erforderlich für die Zahlungsabwicklung).
                </p>
                <p>
                  Die Datenbearbeitung erfolgt auf Grundlage des schweizerischen Datenschutzrechts (DSG) sowie der Datenschutz-Grundverordnung (DSGVO), soweit diese anwendbar ist. Rechtsgrundlagen sind insbesondere die Erfüllung von Verträgen, die Wahrung berechtigter Interessen, die Einwilligung der betroffenen Person sowie gesetzliche Aufbewahrungspflichten.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.purposesTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Die Zwecke der Datenbearbeitung umfassen die Bereitstellung und den Betrieb der Plattform, die Abwicklung von Bestellungen und Verträgen, die Kommunikation mit Nutzerinnen und Nutzern, die Verbesserung der Plattformfunktionen, die Gewährleistung der Sicherheit und Integrität der Systeme, die Erfüllung gesetzlicher und vertraglicher Pflichten sowie die Geltendmachung von Rechtsansprüchen.
                </p>
                <p>
                  Für Marketing- und Werbezwecke (z.B. Newsletter) bearbeiten wir Daten nur, wenn Sie ausdrücklich eingewilligt haben. Eine Einwilligung kann jederzeit widerrufen werden. Analysedaten zur Plattformoptimierung werden in der Regel anonymisiert oder pseudonymisiert verarbeitet.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Share className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.sharingTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Eine Weitergabe von Personendaten an Dritte erfolgt nur, wenn dies für die Erfüllung von Verträgen erforderlich ist (z.B. an Lieferanten zur Lieferabwicklung, an Zahlungsdienstleister zur Zahlungsabwicklung, an Versanddienstleister zur Zustellung). Empfänger von Daten sind zudem Dienstleister, die wir zur technischen und organisatorischen Abwicklung einsetzen (z.B. Hosting-Anbieter, IT-Sicherheitsdienste).
                </p>
                <p>
                  Eine Übermittlung von Daten ins Ausland findet statt, wenn Dienstleister mit Sitz im Ausland eingesetzt werden. In solchen Fällen stellen wir sicher, dass ein angemessener Schutzlevel gewährleistet ist, insbesondere durch Standardvertragsklauseln der EU oder durch andere geeignete rechtliche Instrumente.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Cookie className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.cookiesTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Wir verwenden Cookies und ähnliche Technologien auf der Plattform, um die Nutzung zu erleichtern, die Sicherheit zu gewährleisten und statistische Analysen durchzuführen. Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden. Wir setzen insbesondere notwendige Cookies für den Betrieb der Plattform, funktionale Cookies für die Beibehaltung von Einstellungen sowie Analyse-Cookies zur Verbesserung unseres Angebots.
                </p>
                <p>
                  Die Verwendung von nicht notwendigen Cookies erfolgt nur mit Ihrer ausdrücklichen Einwilligung. Sie können Ihre Einwilligung jederzeit über das Cookie-Banner oder die Cookie-Einstellungen ändern oder widerrufen. In Ihrem Browser können Sie Cookies jederzeit blockieren, löschen oder Einstellungen anpassen; dies kann jedoch die Funktionalität der Plattform beeinträchtigen.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Archive className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.storageTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Personendaten werden nur so lange gespeichert, wie es für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Im Rahmen der Buchführung sind Rechnungen und Vertragsdaten in der Regel für zehn Jahre aufzubewahren. Bestelldaten und Kontaktdaten werden nach Abschluss der Bestellung und Ablauf der Gewährleistungsfristen gelöscht oder anonymisiert, sofern keine rechtlichen Gründe für eine längere Speicherung bestehen.
                </p>
                <p>
                  Nach Ablauf der Aufbewahrungsfristen werden Daten sicher gelöscht oder so anonymisiert, dass ein Personenbezug nicht mehr hergestellt werden kann. Die Löschung erfolgt automatisch nach festgelegten Löschkonzepten oder auf Anfrage der betroffenen Person, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.rightsTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Sie haben als betroffene Person das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten, das Recht auf Berichtigung unrichtiger Daten, das Recht auf Löschung oder Einschränkung der Verarbeitung, das Recht auf Widerspruch gegen die Verarbeitung sowie das Recht auf Datenübertragbarkeit. Diese Rechte können Sie jederzeit geltend machen, soweit gesetzliche oder vertragliche Aufbewahrungspflichten nicht entgegenstehen.
                </p>
                <p>
                  Zur Ausübung Ihrer Rechte können Sie uns über das Kontaktformular oder direkt per E-Mail erreichen. Wir werden Ihrem Antrag unverzüglich und in der Regel innerhalb eines Monats nachgehen. Bei Beschwerden über die Datenbearbeitung können Sie sich an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) wenden.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.securityTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Wir treffen technische und organisatorische Massnahmen zum Schutz Ihrer Personendaten, um einen der Risikolage angemessenen Sicherheitslevel zu gewährleisten. Dazu gehören insbesondere SSL/TLS-Verschlüsselung der Datenübertragungen, Zugriffskontrollen und Berechtigungskonzepte, regelmässige Sicherheitsüberprüfungen, die Minimierung der erhobenen Daten sowie die Schulung der Mitarbeitenden im Bereich Datenschutz.
                </p>
                <p>
                  Der Zugriff auf Personendaten ist nur befugten Personen beschränkt, die diese zur Erfüllung ihrer Aufgaben benötigen. Dienstleister werden sorgfältig ausgewählt und vertraglich zur Einhaltung der Datenschutzvorschriften verpflichtet. Wir sichern die Integrität, Vertraulichkeit und Verfügbarkeit der Daten durch geeignete Massnahmen gegen Datenverlust, unbefugten Zugriff oder unberechtigte Offenlegung.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.changesTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Diese Datenschutzerklärung wird bei Bedarf angepasst, insbesondere bei Änderungen der datenschutzrechtlichen Rahmenbedingungen, der Plattformfunktionen oder der Datenbearbeitungsprozesse. Aktuelle Versionen werden auf der Plattform veröffentlicht und sind jederzeit abrufbar.
                </p>
                <p>
                  Wesentliche Änderungen, die sich auf die Rechte und Pflichten der Nutzerinnen und Nutzer auswirken, werden in geeigneter Form bekannt gegeben, insbesondere durch eine deutliche Hinweis auf der Plattform oder per E-Mail. Änderungen treten in Kraft, sobald die neue Version veröffentlicht ist, sofern nicht ausdrücklich ein anderer Zeitpunkt bestimmt wird.
                </p>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="mt-12 flex justify-center">
            <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary-400 p-8 transition-all duration-300 hover:shadow-lg max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-montserrat font-semibold text-primary-800">{translate('privacy.needHelpTitle')}</h3>
              </div>
              <p className="text-primary-600 font-lora mb-6">
                Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Betroffenenrechte können Sie sich jederzeit an uns wenden. Für allgemeine Anfragen nutzen Sie bitte unser Kontaktformular; bei spezifischen Datenschutzanliegen können Sie uns direkt per E-Mail erreichen. Wir werden Ihr Anliegen prüfen und Ihnen so rasch wie möglich antworten.
              </p>
              <div className="flex gap-4">
                <Link href={`/${lang}/help`} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('helpCenter')}</Link>
                <Link href={`/${lang}/contact`} className="border border-primary-300 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('contact')}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


