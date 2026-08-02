'use client'

import { useState } from 'react'
import styles from './FAQAccordion.module.css'
import { IconChevronDown } from './Icons'

export default function FAQAccordion({ items, defaultOpenIndex = -1 }) {
  const [openIndex, setOpenIndex] = useState(defaultOpenIndex)

  return (
    <div className={styles.list}>
      {items.map((item, index) => {
        const open = index === openIndex
        return (
          <div className={styles.item} key={item.question}>
            <button
              type="button"
              className={styles.question}
              aria-expanded={open}
              onClick={() => setOpenIndex(open ? -1 : index)}
            >
              {item.question}
              <IconChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
            </button>
            <div className={`${styles.answerWrap} ${open ? styles.answerWrapOpen : ''}`}>
              <div className={styles.answerInner}>
                <p className={styles.answer}>{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
