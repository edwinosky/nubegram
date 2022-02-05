import { Col, Divider, Layout, Row, Typography } from 'antd'
import React from 'react'
import useSWRImmutable from 'swr/immutable'
import { fetcher } from '../utils/Fetcher'

const Faq: React.FC = () => {
  const { data: contributors } = useSWRImmutable('/github/contributors', fetcher)

  return <>
    <Layout.Content className="container">
      <Row>
        <Col lg={{ span: 18, offset: 3 }} md={{ span: 20, offset: 2 }} span={24}>
          <Typography.Title>Frequently Asked Questions</Typography.Title>
          <Divider />
          <Typography.Title level={5}>
            Q: Qué es NubeGram?
          </Typography.Title>
          <Typography.Paragraph>
            A: Si alguna vez escuchó acerca de los servicios de almacenamiento en la nube como Google Drive, OneDrive, iCloud, Dropbox o MEGA &mdash; NubeGram (un fork de TeleDrive) es uno de ellos, puede cargar fotos, videos, documentos o cualquier archivo de forma gratuita. Pero, ¿qué hace diferente a NubeGram? Nosotros estamos usando la <a href="https://core.telegram.org/api#telegram-api" target="_blank">Telegram API</a>, para que puedas hacer subidas sin límite y gratis.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Telegram nos permite <a href="https://core.telegram.org/api/obtaining_api_id" target="_blank">crea nuestra aplicación Telegram</a> De forma gratuita siempre que no viole el <a href="https://core.telegram.org/api/terms" target="_blank">terminos</a>. Entonces, NubeGram es una aplicación de terceros de Telegram que utiliza sus API para el servicio de almacenamiento en la nube.
          </Typography.Paragraph>
          <Typography.Title level={5}>
            Q: ¿Para quién es NubeGram?
          </Typography.Title>
          <Typography.Paragraph>
            A: Todos los que merecen servicios de almacenamiento en la nube gratuitos e ilimitados. Desarrolladores, estudiantes, etc. Solo comparamos los precios irracionales de otros servicios de almacenamiento en la nube: <a href="https://one.google.com/about/plans" target="_blank">Google Drive</a>, <a href="https://one.google.com/about/plans" target="_blank">OneDrive</a>, <a href="https://www.dropbox.com/individual/plans-comparison" target="_blank">Dropbox</a>, <a href="https://support.apple.com/en-us/HT201238" target="_blank">iCloud</a> &mdash;
            y le ofrecemos un servicio gratuito para guardar sus medios de forma privada sin límite para equilibrar el mundo.
          </Typography.Paragraph>
          <Typography.Title level={5}>
            Q: ¿Cómo funciona?
          </Typography.Title>
          <Typography.Paragraph>
            A: Para el flujo de autenticación y autorización, estamos usando <a href="https://core.telegram.org/api/auth" target="_blank">este flujo</a>. Primero, necesitamos un número de teléfono válido y pulsamos <a href="https://core.telegram.org/method/auth.sendCode" target="_blank">send code</a> método a la API de Telegram, luego <a href="https://core.telegram.org/method/auth.signIn" target="_blank">sign in</a> con el código de 5 dígitos que se envía a la cuenta de Telegram del usuario.
            Si el código ha caducado, usamos <a href="https://core.telegram.org/method/auth.resendCode" target="_blank">resend code</a> método. Después de eso, obtuvimos la clave de sesión. TeleDrive cerrará la sesión con el <a href="https://jwt.io/" target="_blank">JWT</a> método para que acceda de forma segura a otros puntos finales privados, como cargar, descargar, obtener listas de archivos, etc. No almacenamos su sesión en ningún almacenamiento o base de datos.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Para el flujo de carga y descarga, estamos usando el <a href="https://core.telegram.org/method/upload.getFile" target="_blank">get file</a> y <a href="https://core.telegram.org/method/upload.saveBigFilePart" target="_blank">save big file part</a> métodos. Por cada archivo que carga un usuario, se carga en fragmentos y se pasa a Telegram. Por lo tanto, no puede volver a cargar o cerrar el navegador si aún se está cargando. Todos los archivos que cargue serán
            guardado en los Mensajes guardados en su aplicación Telegram. NubeGram no guarda su archivo en el servidor ni en ningún otro lugar. Entonces, solo usted puede acceder a esos archivos a menos que los comparta con alguien.
          </Typography.Paragraph>
          <Typography.Title level={5}>
            Q: ¿Qué tan segura es NubeGram?
          </Typography.Title>
          <Typography.Paragraph>
            A: Como explicamos en la pregunta anterior, usamos completamente la API de Telegram para el proceso de autenticación. Para el flujo de autorización, usamos múltiples verificaciones para llegar a los puntos finales privados en las API de NubeGram. Primero, necesitamos verificar el token de autenticación con el token secreto que se guarda en la variable de entorno secreta en el servidor. Luego, verificamos la sesión en la API de Telegram para revalidar si eres tú.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Tl;dr Es seguro.
          </Typography.Paragraph>
        </Col>
      </Row>
    </Layout.Content>
  </>
}

export default Faq