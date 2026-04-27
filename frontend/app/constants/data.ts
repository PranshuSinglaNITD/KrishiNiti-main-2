export const Data = `
{
    "input": {
        "crop": "Wheat",
        "quantity_quintal": 50,
        "location": "Hoshangabad, Madhya Pradesh",
        "harvest_in_days": 10
    },
    "harvest_intelligence": {
        "recommended_harvest_day": 10,
        "harvest_window": "April 15 - April 18",
        "crop_maturity_score": 0.92,
        "weather_impact": "Dry and sunny weather forecast for the next 14 days, ideal for moisture reduction below 12%.",
        "risk_alerts": [
            "Heatwave warning in Central MP may lead to grain shriveling if harvest is delayed beyond 15 days."
        ]
    },
    "market_intelligence": {
        "overall_trend": "bullish",
        "arrival_trend": "medium",
        "mandis": [
            {
                "name": "Narmadapuram Mandi",
                "distance_km": 5,
                "current_price": 2450,
                "predicted_prices_next_7_days": [
                    2450,
                    2465,
                    2480,
                    2490,
                    2505,
                    2515,
                    2530
                ],
                "avg_7_day_price": 2490,
                "price_volatility": 0.02,
                "demand_score": 75,
                "confidence": 0.91
            },
            {
                "name": "Itarsi Mandi",
                "distance_km": 18,
                "current_price": 2510,
                "predicted_prices_next_7_days": [
                    2510,
                    2530,
                    2550,
                    2565,
                    2580,
                    2600,
                    2615
                ],
                "avg_7_day_price": 2564,
                "price_volatility": 0.03,
                "demand_score": 88,
                "confidence": 0.89
            },
            {
                "name": "Pipariya Mandi",
                "distance_km": 75,
                "current_price": 2650,
                "predicted_prices_next_7_days": [
                    2650,
                    2670,
                    2695,
                    2710,
                    2730,
                    2755,
                    2780
                ],
                "avg_7_day_price": 2712,
                "price_volatility": 0.04,
                "demand_score": 95,
                "confidence": 0.85
            }
        ]
    },
    "profit_optimization": {
        "transport_cost_per_km": 25,
        "options": [
            {
                "mandi": "Narmadapuram Mandi",
                "distance_km": 5,
                "transport_cost": 125,
                "expected_price": 2450,
                "net_profit": 122375,
                "profit_margin_percent": 99.8
            },
            {
                "mandi": "Itarsi Mandi",
                "distance_km": 18,
                "transport_cost": 450,
                "expected_price": 2510,
                "net_profit": 125050,
                "profit_margin_percent": 99.6
            },
            {
                "mandi": "Pipariya Mandi",
                "distance_km": 75,
                "transport_cost": 1875,
                "expected_price": 2650,
                "net_profit": 130625,
                "profit_margin_percent": 98.5
            }
        ],
        "best_option": {
            "mandi": "Pipariya Mandi",
            "net_profit": 130625
        }
    },
    "decision_engine": {
        "sell_today_profit": 130625,
        "wait_days": 5,
        "sell_later_profit": 137125,
        "profit_difference": 6500,
        "action": "WAIT",
        "confidence_score": 0.88
    },
    "recommendation": {
        "best_mandi": "Pipariya Mandi",
        "best_day_to_sell_in_days": 15,
        "expected_profit_gain": 6500,
        "reasoning": "While Pipariya is 75km away, the price premium for high-quality wheat there outweighs the transport cost. Waiting 5 days post-harvest allows you to capture the upward price trend as local procurement intensity increases.",
        "summary": "Harvest in 10 days, transport to Pipariya Mandi on Day 15 for a net profit of ₹1,37,125."
    },
    "market_visuals": {
        "mandis": [
            {
                "name": "Narmadapuram Mandi",
                "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop",
                "place_description": "A primary local hub for wheat and soy trading with high daily volume.",
                "google_maps_search": "https://www.google.com/maps/search/Narmadapuram+Krishi+Upaj+Mandi"
            },
            {
                "name": "Itarsi Mandi",
                "image_url": "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop",
                "place_description": "Major railway-linked mandi facilitating rapid interstate grain movement.",
                "google_maps_search": "https://www.google.com/maps/search/Itarsi+Mandi"
            },
            {
                "name": "Pipariya Mandi",
                "image_url": "https://images.unsplash.com/photo-1620311210425-41e77983802b?q=80&w=1000&auto=format&fit=crop",
                "place_description": "Renowned for premium Sharbati and Durum wheat varieties with high private buyer presence.",
                "google_maps_search": "https://www.google.com/maps/search/Pipariya+Wheat+Mandi"
            }
        ]
    }
}
`