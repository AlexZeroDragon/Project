from flask import Flask, render_template, request
import time
import requests

app = Flask(__name__)

def get_exoplanet_data(planet_name):
    try:
        start_time = time.time()

        url = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
        query = f"""
        SELECT TOP 1 pl_name, pl_bmasse, pl_rade, st_teff, st_rad, st_mass, pl_orbsmax, pl_orbper, pl_eqt
        FROM ps
        WHERE pl_name = '{planet_name}'
        ORDER BY pl_bmasse DESC NULLS LAST
        """
        params = {
            "query": query,
            "format": "json"
        }

        response = requests.get(url, params=params)

        elapsed_time = time.time() - start_time

        if response.status_code == 200:
            data = response.json()
            if data:
                planet = data[0]
                wikipedia_links = {
                    "ru": f"https://ru.wikipedia.org/wiki/{planet_name.replace(' ', '_')}",
                    "en": f"https://en.wikipedia.org/wiki/{planet_name.replace(' ', '_')}"
                }
                
                return {
                    "planet_data": {
                        "Name": planet.get("pl_name", "N/A"),
                        "Mass (Earth)": planet.get("pl_bmasse", "N/A"),
                        "Radius (Earth)": planet.get("pl_rade", "N/A"),
                        "Star Temp (K)": planet.get("st_teff", "N/A"),
                        "Star Radius (Solar)": planet.get("st_rad", "N/A"),
                        "Star Mass (Solar)": planet.get("st_mass", "N/A"),
                        "Orbital Semi-Major Axis (AU)": planet.get("pl_orbsmax", "N/A"),
                        "Orbital Period (days)": planet.get("pl_orbper", "N/A"),
                        "Equilibrium Temperature (K)": planet.get("pl_eqt", "N/A"),
                        "Equilibrium Temperature (°C / °F)": (
                            f"{planet['pl_eqt'] - 273.15:.1f} °C / {(planet['pl_eqt'] - 273.15) * 9/5 + 32:.1f} °F"
                            if planet.get("pl_eqt") is not None else "N/A"
                        )
                    },
                    "elapsed_time": elapsed_time,
                    "wikipedia_links": wikipedia_links,
                }
            else:
                return {"error": "No data found for the specified planet."}
        else:
            return {"error": f"Error: {response.status_code}"}
    except requests.exceptions.RequestException as e:
        return {"error": f"Request error: {e}"}

@app.route("/", methods=["GET", "POST"])
def home():
    planet_name = None
    planet_data = None
    error = None
    elapsed_time = None
    wikipedia_links = None
    if request.method == "POST":
        planet_name = request.form["planet_name"]
        result = get_exoplanet_data(planet_name)
        if "planet_data" in result:
            planet_data = result["planet_data"]
            elapsed_time = result["elapsed_time"]
            wikipedia_links = result["wikipedia_links"]
        else:
            error = result["error"]
    return render_template("index.html", planet_data=planet_data, error=error,
                           planet_name=planet_name, elapsed_time=elapsed_time, wikipedia_links=wikipedia_links)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=10000)
