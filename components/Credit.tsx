const photos = {
  barcelona: {
    href: "https://commons.wikimedia.org/wiki/File:Barcelona_Airport_by_night_(46021906535).jpg",
    label: "Barcelona at night, Mike McBey, CC BY 2.0",
  },
  haneda: {
    href: "https://commons.wikimedia.org/wiki/File:Haneda_Airport_(4081836433).jpg",
    label: "Haneda, contri, CC BY-SA 2.0",
  },
  boston: {
    href: "https://commons.wikimedia.org/wiki/File:Delta_A220-100_landing_in_the_fog_on_Runway_22L_at_Boston.jpg",
    label: "Boston approach, 4300streetcar, CC BY 4.0",
  },
  dulles: {
    href: "https://commons.wikimedia.org/wiki/File:Washington_Dulles_International_Airport_at_Dusk.jpg",
    label: "Dulles at dusk, Joe Ravi, CC BY-SA 3.0",
  },
  narita: {
    href: "https://commons.wikimedia.org/wiki/File:Airplanes_of_United_Airlines_in_tarmac_at_Narita_Airport_apron_at_night..JPG",
    label: "Narita apron, Nanashinodensyaku, CC BY-SA 4.0",
  },
} as const

export function Credit({ name }: { name: keyof typeof photos }) {
  const photo = photos[name]
  return (
    <p className="credit">
      <a href={photo.href}>{photo.label}</a>
    </p>
  )
}
