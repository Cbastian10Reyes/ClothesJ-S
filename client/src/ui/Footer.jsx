import React from 'react'
import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, GitHub, Globe } from "react-feather"

export default function Footer() {
	return (
		<footer className="grid grid-cols-1 md:(grid-cols-3) border-t border-gray-300 bg-gray-200 px-4">
			<div className="m-4 sm:m-6 flex-1">
				<h2 className="text-4xl text-center md:text-left mb-4">CLOTHES J&S</h2>
				<p className="text-justify text-gray-700">Eiusmod duis reprehenderit quis cillum nisi anim consectetur occaecat cupidatat anim incididunt aliqua eiusmod ad consectetur in ut cupidatat proident dolore aute irure enim in in ut adipisicing in do est.</p>
				<ul className="flex mt-6 justify-center md:justify-start space-x-4">
					<li>
						<Link to="#"><Facebook /></Link>
					</li>				
					<li>
						<Link to="#"><Instagram /></Link>
					</li>				
					<li>
						<Link to="#"><Twitter /></Link>
					</li>
					<li>
						<a href="https://github.com/nimone/Fashion-Store"><GitHub /></a>
					</li>
					<li>
						<a href="https://nimo.pages.dev"><Globe /></a>
					</li>
				</ul>
			</div>			
			<div className="m-4 sm:m-6">
				<h2 className="text-xl text-center md:text-left font-medium mb-4">Enlaces utiles</h2>
				<ul className="flex flex-col flex-wrap h-36 space-y-1 text-gray-600">
					<li>
						<Link to="/">Inicio</Link>
					</li>
					<li>
						<Link to="/cart">Carrito</Link>
					</li>
					<li>
						<Link to="/products?gender=Masculino">Moda Hobre</Link>
					</li>
					<li>
						<Link to="/products?gender=Femenino">Moda Mujer</Link>
					</li>
					<li>
						<Link to="/orders">Seguir Pedido</Link>
					</li>				
					<li>
						<Link to="/terms">Términos y Condiciones</Link>
					</li>
				</ul>
			</div>			
			<div className="m-4 sm:m-6">
				<h2 className="text-xl text-center md:text-left font-medium mb-4">Contacto</h2>
				<ul className="space-y-3 text-gray-700">
					<li className="flex items-center">
						<MapPin className="w-5 h-5 mr-2" />
						<span>Calle 137# 102a-18</span>
					</li>					
					<li className="flex items-center">
						<Phone className="w-5 h-5 mr-2" />
						<span>+57 324 378 8203</span>
					</li>					
					<li className="flex items-center">
						<Mail className="w-5 h-5 mr-2" />
						<a href="mailto:nimogha@gmail.com" target="_blank">
							clothesJ&S@gmail.com
						</a>
					</li>
				</ul>
				<div className="mt-6">
					<img className="mx-auto md:mx-0" src="https://i.ibb.co/Qfvn4z6/payment.png" alt="payment providers" />
				</div>
			</div>
		</footer>
	)
}