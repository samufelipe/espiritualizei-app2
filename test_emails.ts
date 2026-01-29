
import { getWelcomeEmail, getAchievementEmail, getLiturgyEmail, getIntercessionEmail, getInactivityEmail } from './services/emailTemplates';
import * as fs from 'fs';

const testTemplates = () => {
    const welcome = getWelcomeEmail("Samuel Felipe");
    const achievement = getAchievementEmail("Samuel Felipe", "Peregrino Constante");
    const liturgy = getLiturgyEmail("Samuel Felipe", "Quaresma", "#7C3AED");
    const intercession = getIntercessionEmail("Samuel Felipe");
    const inactivity = getInactivityEmail("Samuel Felipe");

    fs.writeFileSync('preview_welcome.html', welcome);
    fs.writeFileSync('preview_achievement.html', achievement);
    fs.writeFileSync('preview_liturgy.html', liturgy);
    fs.writeFileSync('preview_intercession.html', intercession);
    fs.writeFileSync('preview_inactivity.html', inactivity);

    console.log("✅ Previsões de e-mail geradas com sucesso!");
};

testTemplates();
