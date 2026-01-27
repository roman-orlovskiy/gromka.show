import { prisma } from '../utils/prisma'

type ContactPayload = {
  name?: unknown
  email?: unknown
  phone?: unknown
  description?: unknown
}

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const isEmail = (email: string) => {
  // Достаточно строгая проверка без зависимостей
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim())
}

const onlyDigits = (v: string) => v.replace(/\D/g, '')

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as ContactPayload

  const name = isNonEmptyString(body.name) ? body.name.trim() : ''
  const email = isNonEmptyString(body.email) ? normalizeEmail(body.email) : ''
  const description = isNonEmptyString(body.description) ? body.description.trim() : null

  const phoneRaw = isNonEmptyString(body.phone) ? body.phone.trim() : ''
  const phoneDigits = phoneRaw ? onlyDigits(phoneRaw) : ''
  const phone = phoneDigits.length > 0 ? phoneDigits : null

  const errors: Record<string, string> = {}
  if (!name) errors.name = 'required'
  if (!email) errors.email = 'required'
  else if (!isEmail(email)) errors.email = 'invalid'

  if (Object.keys(errors).length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation error',
      data: { errors }
    })
  }

  const ua = getRequestHeader(event, 'user-agent') ?? null
  const referer = getRequestHeader(event, 'referer') ?? null
  const ip =
    getRequestHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    ?? getRequestHeader(event, 'x-real-ip')
    ?? null

  const created = await prisma.contact.create({
    data: {
      name,
      email,
      phone,
      description,
      meta: {
        ua,
        referer,
        ip
      }
    },
    select: {
      id: true
    }
  })

  return { ok: true, id: created.id }
})

