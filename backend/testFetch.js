const fetchMealsByArea = async (area) => {
    try {
        console.log('fetching area...', area);
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        console.log('status', response.status);
        const data = await response.json();
        console.log('data length for', area, ':', data.meals?.length);
        if (data.meals) {
            console.log('First meal:', data.meals[0].strMeal);
        }
    } catch (err) {
        console.error(`Failed to fetch ${area}:`, err);
    }
};

async function test() {
    await fetchMealsByArea('Indian');
    await fetchMealsByArea('Italian');
    await fetchMealsByArea('Chinese');
}

test();
