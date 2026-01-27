const onlyDigits = (v: string) => v.replace(/\D/g, '')

// Простая маска под RU (+7), но терпимо принимает и любые цифры.
// Возвращает строку для отображения в инпуте.
export const formatPhone = (value: string): string => {
  const digits = onlyDigits(value)
  if (!digits) return ''

  // Если пользователь ввёл 8/7 как первый символ — нормализуем к +7
  const normalized = digits.startsWith('8')
    ? `7${digits.slice(1)}`
    : digits.startsWith('7')
      ? digits
      : digits

  // Форматируем только если похоже на RU номер
  if (normalized.startsWith('7')) {
    const d = normalized.slice(1, 11) // 10 цифр после 7
    const p1 = d.slice(0, 3)
    const p2 = d.slice(3, 6)
    const p3 = d.slice(6, 8)
    const p4 = d.slice(8, 10)

    let out = '+7'
    if (p1) out += ` (${p1}`
    if (p1 && p1.length === 3) out += ')'
    if (p2) out += ` ${p2}`
    if (p3) out += `-${p3}`
    if (p4) out += `-${p4}`
    return out
  }

  // Фоллбек: просто цифры с плюсом
  return `+${normalized}`
}

// Для отправки на сервер: только цифры (без +)
export const phoneToDigits = (value: string): string => onlyDigits(value)

