import 'dotenv/config'
import { notarize } from '@electron/notarize'
import { execSync } from 'child_process'
import path from 'path'

console.log('⚡ notarize.js loaded')

export default async function notarizing(context) {
  console.log('🚀 Notarizing started')

  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    console.log('Notarizing stopped: not mac')
    return
  }

  const appName = context.packager.appInfo.productFilename
  const pocketBasePath = path.join('db', 'pocketbase')

  console.log('🔏 Signing PocketBase binary...')
  execSync(`codesign --force --deep --sign "${process.env.CSC_NAME}" "${pocketBasePath}"`, {
    stdio: 'inherit'
  })

  console.log('Notarizing:', appName)
  console.log(process.env.APPLETEAMID, process.env.APPLEID, process.env.APPLEIDPASS)
  return await notarize({
    tool: 'notarytool',
    teamId: process.env.APPLETEAMID,
    appBundleId: 'com.krxiang.snippet.curator',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS
  })
}
