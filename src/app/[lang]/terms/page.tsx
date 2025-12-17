'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/i18n/TranslationProvider';
import { FileText, MapPin, Users, Package, DollarSign, Truck, RotateCcw, UserCheck, Shield, Mail, Database, Copyright, Edit, Gavel } from 'lucide-react';

export default function TermsOfServicePage() {
  const { translate } = useTranslation();
  const pathname = usePathname() || '';
  const segments = pathname.split('/');
  const lang = segments[1] || 'de';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-primary-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-100 to-accent-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-montserrat font-bold text-primary-800">{translate('termsOfService')}</h1>
          <p className="mt-3 text-primary-600 font-lora max-w-2xl">{translate('terms.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="absolute -top-2 -left-2 px-3 py-1 rounded-full text-xs bg-primary-100 text-primary-700 border border-primary-200 font-montserrat font-medium">{translate('terms.badge')}</div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.scopeTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Diese Allgemeinen Geschäftsbedingungen ("AGB") regeln die Nutzung der Online-Plattform "Feinraumshop" (nachfolgend "Plattform"). Betreiberin der Plattform ist Feinraumshop (nachfolgend
                  "Feinraumshop").
                </p>
                <p>
                  Feinraumshop betreibt eine digitale Vermittlungs- und Präsentationsplattform, auf der unabhängige, registrierte Lieferanten bzw. Verkäufer (nachfolgend "Lieferanten") Waren und Leistungen gegenüber
                  Kundinnen und Kunden (nachfolgend "Kundschaft") anbieten und über die Plattform Bestellungen entgegengenommen werden können.
                </p>
                <p>
                  Diese AGB gelten für alle Nutzerinnen und Nutzer der Plattform. Mit dem Zugriff auf die Plattform, der Registrierung, dem Einstellen von Angeboten oder dem Absenden einer Bestellung erklärst du dich mit
                  diesen AGB einverstanden. Abweichende Bedingungen von Nutzerinnen und Nutzern gelten nur, wenn Feinraumshop ihrer Geltung ausdrücklich und schriftlich zustimmt.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.contractTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Feinraumshop ist nicht Verkäuferin der über die Plattform angebotenen Produkte. Ein Kaufvertrag über ein Produkt kommt ausschliesslich zwischen der Kundschaft und dem jeweiligen Lieferanten zustande.
                  Feinraumshop ist lediglich Vermittlerin und stellt die technische Infrastruktur sowie bestimmte unterstützende Services (z.B. Darstellung, Checkout und Kommunikation) zur Verfügung.
                </p>
                <p>
                  Der Bestellprozess erfolgt grundsätzlich wie folgt: Die Kundschaft wählt Produkte aus, legt diese in den Warenkorb und gibt im Checkout die erforderlichen Angaben (insbesondere Lieferadresse,
                  Kontaktangaben, Zahlungsart) ein. Vor Absenden der Bestellung werden alle Bestelldaten angezeigt und können korrigiert werden. Mit dem Anklicken des Buttons zum kostenpflichtigen Bestellen gibt die
                  Kundschaft ein verbindliches Angebot zum Abschluss eines Kaufvertrages gegenüber dem jeweiligen Lieferanten ab.
                </p>
                <p>
                  Eine automatisierte Bestellbestätigung oder Eingangsbestätigung durch Feinraumshop stellt keine Annahme des Angebots dar, sondern bestätigt lediglich den Eingang der Bestellung. Der Kaufvertrag kommt
                  erst zustande, wenn der Lieferant das Angebot ausdrücklich annimmt (z.B. durch eine Auftragsbestätigung) oder die Ware versendet. Feinraumshop kann zur Qualitätssicherung Angebote und Bestellungen nach
                  Massgabe dieser AGB prüfen; eine solche Prüfung ändert nichts daran, dass Vertragspartner der Kundschaft ausschliesslich der Lieferant ist.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.suppliersTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Lieferanten sind verpflichtet, nur solche Produkte anzubieten, die rechtmässig in Verkehr gebracht werden dürfen und deren Beschreibung vollständig, korrekt, nicht irreführend und aktuell ist. Dies
                  umfasst insbesondere Angaben zu Eigenschaften, Material, Masse, Pflegehinweisen, Herkunft, Verfügbarkeit, Lieferzeiten sowie allfälligen Warn- oder Sicherheitshinweisen.
                </p>
                <p>
                  Der Lieferant ist für die ordnungsgemässe Abwicklung der Bestellungen verantwortlich. Dazu zählen insbesondere: Bestellbestätigung, Verpackung, Versand und Lieferung, die Einhaltung der angegebenen
                  Lieferfristen, die Kommunikation mit der Kundschaft bei Verzögerungen, die Ausstellung von Belegen soweit erforderlich sowie die Bearbeitung von Rücksendungen, Reklamationen und Gewährleistungsfällen.
                </p>
                <p>
                  Der Lieferant trägt die Verantwortung für die Preisangaben (inklusive gesetzlich geschuldeter Abgaben, insbesondere Mehrwertsteuer, sofern anwendbar), für die Einhaltung sämtlicher gesetzlichen
                  Vorgaben (z.B. Kennzeichnungs- und Informationspflichten) sowie für Rechte Dritter (z.B. Marken-, Urheber- oder Designrechte). Der Lieferant hält Feinraumshop von sämtlichen Ansprüchen Dritter frei,
                  die aufgrund eines vertrags- oder rechtswidrigen Verhaltens des Lieferanten geltend gemacht werden.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.productsTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Produkte werden von Lieferanten auf der Plattform eingestellt. Feinraumshop kann Inhalte und Produkteinträge nach eigenem Ermessen vor der Veröffentlichung oder auch nachträglich prüfen, freigeben,
                  sperren, ablehnen oder entfernen, insbesondere wenn Anhaltspunkte für Rechtsverstösse, unzulässige Inhalte, fehlende Pflichtangaben, Qualitätsmängel oder ein Risiko für die Kundschaft bestehen.
                </p>
                <p>
                  Feinraumshop ist nicht verpflichtet, jedes Angebot freizugeben. Eine Freigabe stellt keine Garantie für die Richtigkeit der Produktinformationen, die Verfügbarkeit, die Lieferfähigkeit oder die
                  Qualität der Ware dar. Der Lieferant bleibt jederzeit für sein Angebot, die Bestandsführung und die Erfüllung der Bestellung verantwortlich.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.pricingTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Sämtliche Preise auf der Plattform werden in Schweizer Franken (CHF) angezeigt. Massgeblich ist der Preis, der zum Zeitpunkt der Bestellung im Checkout ausgewiesen wird. Preisangaben erfolgen durch
                  die jeweiligen Lieferanten.
                </p>
                <p>
                  Sofern gesetzlich geschuldet, verstehen sich Preise inklusive Mehrwertsteuer (MwSt.). Ob und in welcher Höhe MwSt. anfällt, richtet sich nach den Verhältnissen des jeweiligen Lieferanten sowie der
                  Art der Leistung. Allfällige Versandkosten werden im Bestellprozess transparent ausgewiesen.
                </p>
                <p>
                  Als Zahlungsarten können – je nach Angebot und Verfügbarkeit – insbesondere TWINT, Kreditkarte, PayPal, Rechnung oder weitere von Feinraumshop bzw. dem Lieferanten angebotene Zahlungsmittel zur
                  Verfügung stehen. Die Zahlungsabwicklung kann über externe Zahlungsdienstleister erfolgen; deren Bedingungen können ergänzend gelten. Die Kundschaft ist verpflichtet, nur solche Zahlungsmittel zu
                  verwenden, zu deren Nutzung sie berechtigt ist.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.shippingTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Versand und Lieferung erfolgen grundsätzlich durch den jeweiligen Lieferanten. Sofern im Angebot nichts Abweichendes angegeben ist, beträgt der Standardversand CHF 8.50 (B-Post). Abweichende
                  Versandarten, zusätzliche Kosten (z.B. Sperrgut) oder besondere Lieferbedingungen werden durch den Lieferanten im Angebot oder spätestens im Checkout ausgewiesen.
                </p>
                <p>
                  Lieferfristen sind unverbindliche Richtwerte, sofern nicht ausdrücklich etwas anderes vereinbart ist. Bei Lieferverzögerungen informiert der Lieferant die Kundschaft so rasch wie möglich. Die
                  Kundschaft stellt sicher, dass die Lieferadresse korrekt ist und Sendungen entgegengenommen werden können.
                </p>
                <p>
                  Mit Übergabe der Ware an die Kundschaft (oder eine von ihr benannte empfangsberechtigte Person) geht die Gefahr auf die Kundschaft über, soweit zwingendes Recht nichts anderes vorsieht. Teillieferungen
                  sind zulässig, sofern für die Kundschaft zumutbar; bei Bestellungen von mehreren Lieferanten kann es zu getrennten Sendungen kommen.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <RotateCcw className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.returnsTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Rücksendungen, Reklamationen und Gewährleistungsansprüche werden ausschliesslich durch den jeweiligen Lieferanten bearbeitet. Feinraumshop kann unterstützend Informationen weiterleiten, ist jedoch nicht
                  verpflichtet, die Abwicklung für den Lieferanten zu übernehmen.
                </p>
                <p>
                  In der Schweiz besteht grundsätzlich kein gesetzliches Widerrufsrecht für Onlinekäufe. Ein freiwilliges Rückgaberecht kann der Lieferant im Angebot oder in seinen Bedingungen vorsehen. Massgeblich sind
                  die Rückgabe- und Reklamationsbedingungen des jeweiligen Lieferanten.
                </p>
                <p>
                  Die Kundschaft hat gelieferte Produkte nach Erhalt zu prüfen und Mängel dem Lieferanten innert angemessener Frist anzuzeigen. Die gesetzlichen Gewährleistungsrechte richten sich nach den
                  Bestimmungen des Schweizer Obligationenrechts (OR), soweit der Lieferant keine abweichenden, zulässigen Regelungen trifft.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.customerObligationsTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Die Kundschaft ist verpflichtet, bei Bestellungen vollständige und korrekte Angaben zu machen (insbesondere Name, Lieferadresse, Kontaktinformationen) und die im Checkout angezeigten Informationen
                  (Produktbeschreibung, Preis, Versandkosten, Lieferhinweise) vor Absenden der Bestellung sorgfältig zu prüfen.
                </p>
                <p>
                  Die Kundschaft sorgt dafür, dass Zahlungen fristgerecht erfolgen und dass die gewählte Zahlungsart genutzt werden darf. Eine missbräuchliche Nutzung der Plattform, insbesondere durch falsche
                  Identitätsangaben, Manipulationen, Betrugsversuche oder rechtswidrige Inhalte, ist untersagt.
                </p>
                <p>
                  Nach Erhalt der Ware hat die Kundschaft diese zu prüfen und allfällige Mängel oder Transportschäden unverzüglich dem Lieferanten zu melden. Kommunikationswege (z.B. E-Mail) sind regelmässig zu
                  kontrollieren, damit Rückfragen des Lieferanten zeitnah beantwortet werden können.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.liabilityTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Feinraumshop haftet ausschliesslich für Schäden, die durch Feinraumshop selbst verursacht wurden, und nur bei Vorsatz oder grober Fahrlässigkeit. Bei leichter Fahrlässigkeit haftet Feinraumshop nur
                  bei Verletzung einer wesentlichen Vertragspflicht und beschränkt auf den typischerweise vorhersehbaren Schaden.
                </p>
                <p>
                  Feinraumshop haftet nicht für Handlungen, Unterlassungen, Produktangaben, Lieferverzögerungen, Mängel, Gewährleistung oder sonstige Pflichtverletzungen der Lieferanten. Ansprüche aus dem Kaufvertrag
                  sind ausschliesslich gegenüber dem jeweiligen Lieferanten geltend zu machen.
                </p>
                <p>
                  Die Haftung für indirekte Schäden, Folgeschäden, entgangenen Gewinn, Datenverlust oder sonstige reine Vermögensschäden ist – soweit gesetzlich zulässig – ausgeschlossen. Zwingende gesetzliche
                  Haftungsbestimmungen bleiben vorbehalten.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.marketingTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Feinraumshop sendet Marketing-Mitteilungen (z.B. Newsletter, Aktionen, Produktempfehlungen) nur, wenn du ausdrücklich eingewilligt hast (z.B. durch eine Anmeldung zum Newsletter). Eine Einwilligung ist
                  freiwillig und nicht Voraussetzung für den Einkauf.
                </p>
                <p>
                  Du kannst eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, insbesondere über den Abmeldelink in einer E-Mail oder über die Kontaktmöglichkeiten auf der Plattform.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.dataProtectionTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Feinraumshop bearbeitet Personendaten im Zusammenhang mit dem Betrieb der Plattform und der Abwicklung von Bestellungen gemäss den anwendbaren Datenschutzbestimmungen. Einzelheiten zu Art, Umfang,
                  Zweck und Rechtsgrundlagen der Datenbearbeitung sowie zu deinen Rechten findest du in unserer Datenschutzerklärung.
                </p>
                <p>
                  Die Datenschutzerklärung ist unter
                  {' '}
                  <Link href={`/${lang}/privacy`} className="underline decoration-primary-300 hover:decoration-primary-500">
                    /{lang}/privacy
                  </Link>
                  {' '}
                  abrufbar und gilt ergänzend zu diesen AGB.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Copyright className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.intellectualPropertyTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Sämtliche Inhalte der Plattform (insbesondere Texte, Grafiken, Logos, Fotografien, Designs, Marken, Software und Datenbanken) sind urheberrechtlich und/oder durch andere Schutzrechte zugunsten von
                  Feinraumshop oder Dritten geschützt. Die Nutzung der Plattform begründet keine Übertragung von Schutzrechten.
                </p>
                <p>
                  Die Kundschaft erhält ein nicht exklusives, nicht übertragbares und jederzeit widerrufliches Recht, die Plattform ausschliesslich für private Zwecke und gemäss diesen AGB zu nutzen. Jede weitergehende
                  Nutzung (insbesondere Vervielfältigung, Verbreitung, öffentliche Wiedergabe, Scraping, Reverse Engineering) ist ohne vorherige schriftliche Zustimmung unzulässig.
                </p>
                <p>
                  Inhalte, die Lieferanten auf der Plattform bereitstellen (z.B. Produktbilder, Beschreibungen), verbleiben im Verantwortungsbereich der Lieferanten. Der Lieferant stellt sicher, dass er die hierfür
                  erforderlichen Rechte besitzt.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Edit className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.changesTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Feinraumshop kann diese AGB jederzeit anpassen, insbesondere bei Änderungen der gesetzlichen Rahmenbedingungen, der technischen Entwicklung der Plattform oder der angebotenen Dienstleistungen.
                  Änderungen werden auf der Plattform veröffentlicht.
                </p>
                <p>
                  Soweit rechtlich erforderlich, wird Feinraumshop über wesentliche Änderungen in geeigneter Form informieren. Die weitere Nutzung der Plattform nach Inkrafttreten der Änderungen gilt als Zustimmung,
                  sofern die Kundschaft der Änderung nicht innerhalb einer angemessenen Frist widerspricht.
                </p>
              </div>
            </section>

            <section className="group relative bg-white rounded-2xl shadow-sm border border-primary-200 p-6 transition-all duration-300 hover:border-primary-400 hover:shadow-lg">
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary-300 transition-all duration-300 pointer-events-none" />
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.lawTitle')}</h2>
              </div>
              <div className="text-primary-600 font-lora space-y-4">
                <p>
                  Es gilt schweizerisches Recht unter Ausschluss seiner kollisionsrechtlichen Normen. Zwingende Bestimmungen des Rechts am Wohnsitz der Kundschaft bleiben vorbehalten, soweit anwendbar.
                </p>
                <p>
                  Gerichtsstand für Streitigkeiten im Zusammenhang mit der Plattformnutzung zwischen Feinraumshop und Nutzerinnen/Nutzern ist – soweit zulässig – Arbon, Schweiz.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar */}
          <div className="mt-12 flex justify-center">
            <div className="group relative bg-white rounded-2xl shadow-sm border-2 border-transparent hover:border-primary-400 p-8 transition-all duration-300 hover:shadow-lg max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-montserrat font-semibold text-primary-800">{translate('terms.questionsTitle')}</h3>
              </div>
              <p className="text-primary-600 font-lora mb-6">
                Bei Fragen zu diesen AGB oder zur Nutzung der Plattform findest du Antworten im Hilfe-Center. Für Anliegen, die eine individuelle Abklärung erfordern, kannst du uns über das Kontaktformular erreichen.
                Bitte beachte: Bei Fragen zu einer konkreten Bestellung, Lieferung, Rückgabe oder Gewährleistung ist in erster Linie der jeweilige Lieferant zuständig.
              </p>
              <div className="flex gap-4">
                <Link href={`/${lang}/help`} className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('helpCenter')}</Link>
                <Link href={`/${lang}/contact`} className="border border-primary-300 text-primary-700 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors shadow-sm hover:shadow-md font-montserrat font-medium">{translate('contact')}</Link>
              </div>
            </div>
          </div>
      </div>
    </div>
  );

}
