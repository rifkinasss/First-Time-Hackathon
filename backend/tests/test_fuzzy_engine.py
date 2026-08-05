from app.fuzzy_engine import infer_mamdani


def test_mamdani_high_risk_from_low_productivity_population_and_fuel():
    result = infer_mamdani(
        productivity=400,
        population=100,
        fuel_deviation_ratio=1.15,
        productivity_values=[400, 700, 900],
        population_values=[2, 8, 100],
    )

    assert result["risk_level"] == "HIGH"
    assert result["risk_score"] > 0.65
    assert result["membership"]["fuel"]["UP"] == 1.0
    assert "R4_low_productivity_high_population" in result["dominant_rules"]


def test_mamdani_low_risk_from_productive_efficient_operation():
    result = infer_mamdani(
        productivity=900,
        population=2,
        fuel_deviation_ratio=0.85,
        productivity_values=[400, 700, 900],
        population_values=[2, 8, 100],
    )

    assert result["risk_level"] == "LOW"
    assert result["risk_score"] < 0.35
    assert result["membership"]["productivity"]["UP"] == 1.0


def test_mamdani_normal_operation_is_centroid_middle():
    result = infer_mamdani(
        productivity=700,
        population=8,
        fuel_deviation_ratio=1.0,
        productivity_values=[400, 700, 900],
        population_values=[2, 8, 100],
    )

    assert result["risk_level"] == "NORMAL"
    assert 0.45 <= result["risk_score"] <= 0.55
    assert result["dominant_rules"] == "R6_normal_operation"
