"use client";

import { ArrowLeft, FileText, Shield, UserCheck, Scroll } from "lucide-react";
import { useState } from "react";

type Props = {
  onBack: () => void;
};

type LegalDoc = "terms" | "privacy" | "usage";

export function LegalPage({ onBack }: Props) {
  const [activeDoc, setActiveDoc] = useState<LegalDoc>("terms");

  const docs = [
    { id: "terms" as const, label: "Términos y Condiciones", icon: FileText },
    { id: "privacy" as const, label: "Política de Privacidad", icon: Shield },
    { id: "usage" as const, label: "Términos de Uso", icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-border">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16 max-w-5xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div className="flex items-center gap-2.5">
            <img src="/logo-vecinoclaro.png" alt="VecinoClaro" className="h-8 w-8 object-cover" />
            <span className="font-bold text-sm">VecinoClaro</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-4">
            <Scroll className="h-3.5 w-3.5" />
            Documentos Legales
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Información Legal</h1>
          <p className="text-muted-foreground text-sm">
            Última actualización: 30 de junio de 2026
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-8">
          {docs.map((doc) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDoc(doc.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeDoc === doc.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {doc.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {activeDoc === "terms" && <TermsAndConditions />}
          {activeDoc === "privacy" && <PrivacyPolicy />}
          {activeDoc === "usage" && <UsageTerms />}
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 VecinoClaro · Cuentas Claras, Vecinos Claros · Hecho en Venezuela 🇻🇪
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Para consultas legales: vecinoclaroapp@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}

function TermsAndConditions() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">1. Aceptación de los Términos</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Al registrarse y utilizar la plataforma VecinoClaro (en adelante, "la Plataforma"), usted acepta de manera plena e incondicional los presentes Términos y Condiciones. Si no está de acuerdo con alguno de los términos aquí establecidos, no deberá utilizar la Plataforma. El uso continuado de la Plataforma constituye una aceptación de cualquier modificación que se realice a estos términos.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">2. Descripción del Servicio</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro es una plataforma SaaS (Software as a Service) bimonetaria (USD/VES) diseñada para la gestión de condominios y residencias en Venezuela. La Plataforma ofrece herramientas para contabilidad bimonetaria, gestión de pagos, verificación de comprobantes con Inteligencia Artificial, libro contable inmutable con hash chain SHA-256, votaciones por vecinos, comunicaciones internas, seguridad y administración de condominios.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          El servicio incluye una plataforma web para administradores y una aplicación móvil nativa para residentes. Ambas comparten la misma base de datos y APIs, pero ofrecen experiencias diferenciadas según el rol del usuario.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">3. Membresía y Tarifas</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          El modelo de membresía de VecinoClaro se basa en una tarifa de <strong>$2 USD por apartamento activo por mes</strong>, facturada a tasa BCV del día. El condominio paga el total resultante de multiplicar $2 por el número de apartamentos activos. Esta tarifa incluye acceso completo a todos los módulos activables de la Plataforma.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          El pago de la membresía es responsabilidad del administrador del condominio, quien debe realizarlo mensualmente. La falta de pago puede resultar en la suspensión temporal del servicio hasta que se regularice la membresía. No se aplican comisiones ocultas ni costos adicionales por transacción.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">4. Roles y Responsabilidades</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma reconoce cuatro roles principales: <strong>ADMIN</strong> (acceso total y configuración), <strong>TREASURER</strong> (gestión financiera), <strong>MODERATOR</strong> (comunicación y moderación), y <strong>RESIDENT</strong> (acceso a sus propios datos y pagos). Cada rol tiene permisos específicos que se aplican tanto en la plataforma web como en la aplicación móvil.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          El administrador es responsable de la veracidad de los datos ingresados en el sistema, incluyendo información del condominio, viviendas, y configuraciones. Los residentes son responsables de la veracidad de sus datos personales y de los comprobantes de pago que suban a la Plataforma.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">5. Verificación de Comprobantes con IA</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma utiliza Inteligencia Artificial (Groq Llama 3.2 90B Vision) para analizar comprobantes de pago subidos por los residentes. El análisis incluye OCR (reconocimiento óptico de caracteres) para extraer monto, fecha, banco y referencia, así como detección de señales de fraude. Sin embargo, la decisión final de aprobar o rechazar un comprobante corresponde exclusivamente al administrador del condominio.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          VecinoClaro no se hace responsable de decisiones incorrectas basadas en la información proporcionada por la IA. La IA es una herramienta de asistencia, no de decisión automática. El administrador debe verificar manualmente la información antes de aprobar o rechazar cualquier comprobante.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">6. Integridad de Datos y Hash Chain</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma utiliza una cadena de hashes SHA-256 para garantizar la inmutabilidad del libro contable. Cada asiento contable sella el anterior con su hash, creando una cadena verificable criptográficamente. Alterar un registro retroactivamente rompe la cadena y hace evidente la manipulación.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          VecinoClaro se compromete a mantener la integridad de esta cadena y a no modificar, eliminar ni alterar ningún registro contable una vez creado. Los usuarios pueden solicitar auditoría de la cadena en cualquier momento.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">7. Limitación de Responsabilidad</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro es una herramienta de gestión y no constituye un servicio de asesoría financiera, legal ni contable. Las decisiones tomadas por los administradores y residentes basadas en la información de la Plataforma son de su exclusiva responsabilidad. VecinoClaro no se hace responsable por errores en los datos ingresados, decisiones administrativas, ni disputas entre vecinos.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          La Plataforma depende de servicios de terceros (Supabase, Groq, DolarApi.com, Gmail SMTP) cuya disponibilidad está fuera del control de VecinoClaro. En caso de interrupciones de servicio de terceros, VecinoClaro no será responsable por datos no disponibles temporalmente.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">8. Modificaciones</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán efectivas desde su publicación en la Plataforma. Se recomienda a los usuarios revisar periódicamente este documento. El uso continuado de la Plataforma después de las modificaciones constituye aceptación de los nuevos términos.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">9. Ley Aplicable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Estos Términos y Condiciones se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier disputa relacionada con la Plataforma será resuelta conforme a la legislación venezolana, específicamente la Ley de Propiedad Horizontal y las normativas aplicables a servicios tecnológicos.
        </p>
      </section>
    </div>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">1. Información que Recopilamos</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro recopila la siguiente información personal de los usuarios: nombre completo, correo electrónico, número de teléfono, rol en el condominio (administrador, tesorero, moderador o residente), y datos de la vivienda (número, piso, tipo). También recopilamos información sobre pagos realizados, comprobantes subidos, votaciones emitidas, solicitudes creadas, y mensajes enviados dentro de la Plataforma.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Para los administradores, también recopilamos información del condominio: nombre, RIF, dirección, ciudad, y datos de contacto del administrador. Para los residentes, almacenamos el código de invitación utilizado para vincularse al condominio.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">2. Uso de la Información</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La información recopilada se utiliza exclusivamente para: (a) gestionar la cuenta del usuario y su acceso a la Plataforma; (b) procesar y verificar pagos y comprobantes; (c) mantener el libro contable del condominio; (d) enviar notificaciones sobre eventos relevantes (pagos aprobados, avisos, votaciones); (e) generar reportes financieros para el administrador; (f) facilitar la comunicación entre vecinos y administradores.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          VecinoClaro NO vende, alquila ni comparte información personal de los usuarios con terceros con fines comerciales. La información se utiliza únicamente para la operación de la Plataforma y la gestión del condominio.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">3. Almacenamiento y Seguridad</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Los datos se almacenan en Supabase PostgreSQL, un servicio de base de datos hosted que cumple con estándares de seguridad de la industria. Las contraseñas se almacenan cifradas utilizando bcrypt. La autenticación se realiza mediante JWT (JSON Web Tokens) con una validez de 30 días.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          La Plataforma utiliza HTTPS para todas las comunicaciones. El libro contable utiliza hash chain SHA-256 para garantizar la integridad e inmutabilidad de los registros financieros. Las imágenes de comprobantes se almacenan con un hash SHA-256 para detectar duplicados.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">4. Comprobantes y Verificación con IA</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cuando un residente sube un comprobante de pago, la imagen es enviada a Groq (servicio de IA) para análisis de OCR y detección de fraude. Groq procesa la imagen y devuelve los datos extraídos (monto, fecha, banco, referencia). La imagen no se almacena en los servidores de Groq de forma permanente; se procesa y se descarta.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Los comprobantes se almacenan en la base de datos de VecinoClaro y son accesibles únicamente por el administrador del condominio y el residente que los subió. El administrador puede ver todos los comprobantes del condominio; los residentes solo pueden ver los propios.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">5. Notificaciones por Email</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro envía notificaciones por correo electrónico (Gmail SMTP) cuando ocurren eventos relevantes: pago aprobado, pago rechazado, nuevo aviso del condominio, nueva votación. Los emails se envían desde vecinoclaroapp@gmail.com. El usuario puede solicitar no recibir emails, pero las notificaciones in-app seguirán activas.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">6. Privacidad entre Condominios</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma es multi-tenant: cada condominio tiene sus datos aislados. Un usuario de un condominio no puede acceder a los datos de otro condominio. Los residentes solo pueden ver sus propios pagos, facturas y datos personales. El directorio de vecinos muestra información limitada (nombre, vivienda, teléfono) que el administrador decide publicar.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          La lista de morosos NO muestra el nombre del propietario para proteger la privacidad. Solo muestra el número de vivienda y el monto de la deuda.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">7. Derechos del Usuario</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Los usuarios tienen derecho a: (a) acceder a sus datos personales almacenados en la Plataforma; (b) solicitar la corrección de datos incorrectos; (c) solicitar la eliminación de su cuenta y datos personales, sujeto a las obligaciones legales de conservación de registros contables; (d) exportar sus datos en formato CSV.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Para ejercer estos derechos, el usuario debe contactar a vecinoclaroapp@gmail.com. Las solicitudes se procesan en un plazo máximo de 15 días hábiles.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">8. Cookies y Datos de Navegación</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma utiliza cookies de sesión (JWT) para mantener la autenticación del usuario. No se utilizan cookies de tracking, publicidad ni analíticas de terceros. La aplicación móvil nativa no utiliza cookies; almacena el token de sesión en secure storage del dispositivo.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">9. Retención de Datos</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Los datos financieros (pagos, facturas, asientos contables) se conservan de forma indefinida debido a que conforman el libro contable del condominio y están protegidos por la cadena SHA-256. Los datos personales (nombre, email, teléfono) se conservan mientras la cuenta esté activa. Al desactivar una cuenta, los datos personales se anonimizan pero los registros contables se mantienen.
        </p>
      </section>
    </div>
  );
}

function UsageTerms() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">1. Uso Aceptable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          El usuario se compromete a utilizar la Plataforma VecinoClaro de manera lícita, respetando la legislación venezolana y los derechos de otros usuarios. Queda estrictamente prohibido: (a) subir comprobantes falsos o manipulados; (b) intentar acceder a datos de otros condominios o usuarios sin autorización; (c) realizar ingeniería inversa de la Plataforma; (d) utilizar bots o scripts automatizados para interactuar con las APIs; (e) publicar contenido ofensivo, difamatorio o ilegal en avisos, mensajes o marketplace.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">2. Registro de Cuenta</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Para utilizar la Plataforma, el usuario debe registrarse con un correo electrónico válido y una contraseña de mínimo 6 caracteres. El usuario es responsable de mantener la confidencialidad de su contraseña y de todas las actividades realizadas con su cuenta. En caso de sospecha de uso no autorizado, el usuario debe notificar inmediatamente al administrador del condominio o a vecinoclaroapp@gmail.com.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          Los administradores se registran directamente en la plataforma web. Los residentes se registran a través de la aplicación móvil nativa utilizando un código de invitación proporcionado por el administrador de su condominio.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">3. Pagos y Transacciones</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma facilita el registro y seguimiento de pagos entre residentes y el condominio, pero <strong>no procesa transacciones financieras directamente</strong>. Los pagos se realizan externamente a través de Pago Móvil, Zelle, transferencias bancarias o efectivo, directamente a las cuentas del condominio. VecinoClaro únicamente registra y verifica estos pagos.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          El residente es responsable de realizar el pago al beneficiario correcto y subir el comprobante correspondiente. El administrador es responsable de verificar la autenticidad del comprobante antes de aprobarlo. VecinoClaro no interviene en la transferencia de fondos entre el residente y el condominio.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">4. Votaciones y Decisiones Comunitarias</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Las votaciones realizadas a través de la Plataforma tienen peso por vecinos conforme a la Ley de Propiedad Horizontal de Venezuela. Cada voto vale según la alícuota de la vivienda del residente. Los resultados de las votaciones son vinculantes para el condominio en la medida que cumplan con los requisitos legales de quórum y mayoría establecidos en la Ley.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          VecinoClaro no garantiza que las votaciones realizadas en la Plataforma cumplan con todos los requisitos legales aplicables. Es responsabilidad del administrador verificar que el proceso de votación cumpla con la normativa vigente.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">5. Disponibilidad del Servicio</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro se esfuerza por mantener la Plataforma disponible 24/7, pero no garantiza disponibilidad continua. El servicio puede ser interrumpido por mantenimiento, actualizaciones, o causas fuera de nuestro control (fallos de Supabase, Groq, DolarApi.com, o Gmail SMTP). La aplicación móvil nativa funciona en modo offline para datos previamente cacheados.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          En caso de interrupción del servicio, VecinoClaro trabajará para restaurarlo lo antes posible. No se ofrece compensación por tiempo de inactividad, excepto en casos de interrupciones prolongadas (más de 48 horas) causadas por negligencia de VecinoClaro.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">6. Propiedad Intelectual</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La Plataforma VecinoClaro, incluyendo su código fuente, diseño, logo, nombre comercial, eslogan "Cuentas Claras, Vecinos Claros", y todos los contenidos asociados, son propiedad de VecinoClaro. El usuario no adquiere ningún derecho de propiedad sobre la Plataforma mediante el uso de la misma.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          El contenido publicado por los usuarios (avisos, mensajes, publicaciones de marketplace) es propiedad del usuario que lo publica. VecinoClaro tiene licencia para mostrar este contenido dentro de la Plataforma mientras la cuenta esté activa.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">7. Suspensión y Cancelación</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro puede suspender o cancelar cuentas que: (a) violen estos Términos de Uso; (b) suban comprobantes falsos de manera repetida; (c) utilicen la Plataforma para actividades ilícitas; (d) no paguen la membresía mensual del condominio por más de 60 días. La suspensión o cancelación no exime al usuario de sus obligaciones financieras con el condominio.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          El usuario puede cancelar su cuenta en cualquier momento solicitándolo a vecinoclaroapp@gmail.com o a través de la opción "Cerrar sesión" en la aplicación. La cancelación no elimina los registros contables asociados a la cuenta, que se conservan por obligación legal.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">8. Soporte Técnico</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          VecinoClaro proporciona soporte técnico a través del correo vecinoclaroapp@gmail.com. Los administradores tienen prioridad en el soporte. El tiempo de respuesta objetivo es de 24 a 48 horas hábiles. El soporte no incluye asesoría contable, legal ni financiera.
        </p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3 text-emerald-700 dark:text-emerald-400">9. Contacto</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Para cualquier consulta sobre estos Términos de Uso, puede contactarnos en: <strong>vecinoclaroapp@gmail.com</strong>. Para consultas sobre su condominio específico, contacte a su administrador directamente a través de la Plataforma.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          VecinoClaro es una plataforma desarrollada en Venezuela, para Venezuela. Cumplimos con la legislación venezolana aplicable y respetamos la Ley de Propiedad Horizontal en todas nuestras funcionalidades relacionadas con gestión de condominios.
        </p>
      </section>
    </div>
  );
}
