import React from "react"

import { sliderItems } from "@/dummydata"

import Carousel from "../components/Carousel"

export default function HomePage() {
  return (
    <main>
      <section>
        <Carousel slides={sliderItems} />
      </section>
    </main>
  )
}