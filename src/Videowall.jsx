import React, { useEffect, useState } from "react";
import axios from "axios";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Autoplay } from "swiper/modules";
import Card from "./Card";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import fotochat from "./chatyipiti.png";
import apol from "./apol.png";
import meta from "./meta.png";
import "./Videowall.css";
import DreamLab from "./DreamLab.png";

const imageUrls = [
  {
    src: fotochat,
    title: "Chatyipiti",
    description: "Descripción de Chatyipiti",
  },
  { src: apol, title: "Apol", description: "Descripción de Apol" },
  { src: meta, title: "Meta", description: "Descripción de Meta" },
];

const VideoWall = () => {
  const [reservaciones, setReservaciones] = useState([]);
  const [fechaActual, setFechaActual] = useState("");
  const [pausedColumns, setPausedColumns] = useState([]);

  useEffect(() => {
    const fetchReservaciones = async () => {
      try {
        const response = await axios.get(
          "https://devspaceapi2.azurewebsites.net/api/info_reservaciones"
        );
        setReservaciones(response.data);
      } catch (error) {
        console.error("Error fetching reservaciones:", error);
      }
    };

    fetchReservaciones();

    const actualizarFecha = () => {
      const fecha = new Date();
      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const meses = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ];
      const diaSemana = diasSemana[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];
      const año = fecha.getFullYear();
      const hora = fecha.getHours();
      const minutos = fecha.getMinutes().toString().padStart(2, "0");
      const ampm = hora >= 12 ? "PM" : "AM";
      const hora12 = hora % 12 || 12;

      setFechaActual({
        diaSemana,
        fecha: `${dia} de ${mes} de ${año}`,
        hora: `${hora12}:${minutos} ${ampm}`,
      });
    };

    actualizarFecha();
    const interval = setInterval(actualizarFecha, 1000); // Actualiza cada minuto

    return () => clearInterval(interval);
  }, []);

  const convertirHora = (hora) => {
    const [hour, minute] = hora.split(":");
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const handleCardClick = (columnIndex) => {
    setPausedColumns((prevPausedColumns) => {
      if (prevPausedColumns.includes(columnIndex)) {
        return prevPausedColumns.filter((index) => index !== columnIndex);
      } else {
        return [...prevPausedColumns, columnIndex];
      }
    });
  };

  const renderVerticalCarousel = (direction, columnIndex) => {
    const isDown = direction === "down";
    const isPaused = pausedColumns.includes(columnIndex);
    return (
      <div
        className={`vertical-carousel ${isDown ? "scroll-down" : "scroll-up"} ${
          isPaused ? "paused" : ""
        }`}
      >
        {imageUrls.map((image, index) => (
          <Card
            key={index}
            image={image}
            onClick={() => handleCardClick(columnIndex)}
            isPaused={isPaused}
          />
        ))}
        {imageUrls.map((image, index) => (
          <Card
            key={`duplicate-${index}`}
            image={image}
            onClick={() => handleCardClick(columnIndex)}
            isPaused={isPaused}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="grid grid-cols-8">
        <div className="col-span-7">
          {reservaciones && reservaciones.length > 0 ? (
            <div className="overflow-hidden">
              <Swiper
                modules={[FreeMode, Mousewheel, Autoplay]}
                slidesPerView={4}
                spaceBetween={20}
                loop={true}
                mousewheel={true}
                freeMode={true}
                speed={5000}
                autoplay={{
                  delay: 2,
                  disableOnInteraction: false,
                }}
                className="mySwiper"
              >
                {reservaciones.map((reservacion, index) => {
                  const textLength = reservacion.NombreEstudiante.length;
                  const percentage = Math.min(textLength * 0.75, 100); // Porcentaje máximo de 100%
                  const duration = Math.min(textLength * 0.25, 10); // Duración mínima de 10 segundos

                  return (
                    <SwiperSlide key={index}>
                      <div className="reservation-card">
                        <p
                          className="student-name animated-text"
                          style={{
                            "--duration": `${duration}s`,
                            "--percentage": `${percentage}%`,
                          }}
                        >
                          {reservacion.NombreEstudiante}
                        </p>
                        <p className="room-name">{reservacion.NombreSala}</p>
                        <p className="time-range">
                          {convertirHora(reservacion.HoraInicio)} -{" "}
                          {convertirHora(reservacion.HoraFin)}
                        </p>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          ) : (
            <div
              style={{ height: "100%", color: "white" }}
              className="flex items-center justify-center manejo-reservas"
            >
              <p className="no-reservations">
                No hay reservaciones para el día de hoy
              </p>
            </div>
          )}
        </div>
        <div className="col-span-1 flex items-center justify-center relative">
          <div className="text-white text-center p-4 z-10">
            <p className="fecha-dia">{fechaActual.diaSemana}</p>
            <p className="fecha-fecha">{fechaActual.fecha}</p>
            <p className="fecha-hora">{fechaActual.hora}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 flex-1 background-gradient">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="column">
            {renderVerticalCarousel(i % 2 === 0 ? "down" : "up", i)}
          </div>
        ))}
        <div className="col-span-1 flex items-start justify-center relative">
          <div className="text-white text-center p-4 z-10">
            <p className="bienvenida">BIENVENIDX</p>
            <p className="bienvenida-peque">a</p>
            <img src={DreamLab} alt="DreamLab" className="dreamlab" />
            <p className="bienvenida">D.R.E.A.M. LAB</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoWall;
