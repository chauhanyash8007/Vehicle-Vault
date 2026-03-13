import { Link } from "react-router-dom";

const Homepage = () => {
  const featuredVehicles = [
    {
      id: 1,
      brand: "Tesla",
      model: "Model S Plaid",
      price: 129990,
      image:
        "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=250&fit=crop",
      fuelType: "Electric",
      range: "405 miles",
      acceleration: "1.99s 0-60mph",
    },
    {
      id: 2,
      brand: "BMW",
      model: "X5 M Competition",
      price: 108900,
      image:
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop",
      fuelType: "Petrol",
      range: "18 mpg",
      acceleration: "3.8s 0-60mph",
    },
    {
      id: 3,
      brand: "Audi",
      model: "e-tron GT",
      price: 102400,
      image:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop",
      fuelType: "Electric",
      range: "238 miles",
      acceleration: "3.9s 0-60mph",
    },
    {
      id: 4,
      brand: "Mercedes",
      model: "AMG GT 63S",
      price: 158500,
      image:
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop",
      fuelType: "Petrol",
      range: "16 mpg",
      acceleration: "3.1s 0-60mph",
    },
    {
      id: 5,
      brand: "Porsche",
      model: "Taycan Turbo S",
      price: 185000,
      image:
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop",
      fuelType: "Electric",
      range: "227 miles",
      acceleration: "2.6s 0-60mph",
    },
    {
      id: 6,
      brand: "Lamborghini",
      model: "Huracán EVO",
      price: 248295,
      image:
        "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=400&h=250&fit=crop",
      fuelType: "Petrol",
      range: "14 mpg",
      acceleration: "2.9s 0-60mph",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-black/30 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                🚗
              </div>
              <span className="text-2xl font-bold text-white">
                Vehicle Vault
              </span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/" className="text-white/80 hover:text-white">
                Home
              </Link>

              <Link to="/vehicles" className="text-white/80 hover:text-white">
                Vehicles
              </Link>

              <Link
                to="/login"
                className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-xl hover:opacity-90"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-36 pb-20 text-center px-6">
        <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
          Find & Compare Your Perfect Vehicle
        </h1>

        <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10">
          Vehicle Vault helps you search, analyze and compare vehicles to make
          smarter buying decisions.
        </p>

        <Link
          to="/vehicles"
          className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl text-lg hover:opacity-90"
        >
          Explore Vehicles
        </Link>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl text-center text-white font-bold mb-12">
            Featured Vehicles
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:scale-105 transition duration-300"
              >
                <img
                  src={vehicle.image}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  loading="lazy"
                  className="w-full h-56 object-cover"
                />

                <div className="p-6">
                  <h3 className="text-xl text-white font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h3>

                  <p className="text-blue-400 text-lg font-semibold mt-2">
                    {vehicle.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>

                  <div className="flex justify-between text-sm text-white/70 mt-4">
                    <span>{vehicle.fuelType}</span>
                    <span>{vehicle.range}</span>
                  </div>

                  <div className="text-sm text-white/70 mt-1">
                    {vehicle.acceleration}
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Link
                      to={`/vehicle/${vehicle.id}`}
                      className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      View Details
                    </Link>

                    <Link
                      to={`/compare/${vehicle.id}`}
                      className="flex-1 text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                    >
                      Compare
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center text-white/60">
        © 2026 Vehicle Vault — MERN Stack Project
      </footer>
    </div>
  );
};

export default Homepage;
