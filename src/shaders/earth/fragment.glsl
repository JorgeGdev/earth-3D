uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform float uClouds;
uniform vec3 UatmosphereDayColor;
uniform vec3 UatmosphereTwilightColor;





varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = vec3(0.0);

    //SUN ORIENTATION
    
    float sunOrientation = dot(uSunDirection, normal);
    



    //DAY/NIGHT COLOR
    float daymix = smoothstep(-0.25, 0.5, sunOrientation);
    vec3 dayColor = texture(uDayTexture, vUv).rgb;
    vec3 nightColor = texture(uNightTexture, vUv).rgb;

    color = mix(nightColor, dayColor, daymix);

    //SPECULAR CLOUDS COLOR

    vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;

    //clouds

    float cloudsMix = smoothstep(uClouds, 1.0, specularCloudsColor.g);
    cloudsMix *= daymix;
    color = mix(color, vec3(1.0), cloudsMix);

    //FRESNEL

    float fresnel = dot(viewDirection, normal) + 1.0;
    fresnel = pow(fresnel,2.0);
    


    //ATMOSPHERE

    float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
    vec3 atmosphereColor = mix(UatmosphereTwilightColor, UatmosphereDayColor, atmosphereDayMix);
    color = mix(color,atmosphereColor, fresnel * atmosphereDayMix);


    // SPECULAR 

    vec3 reflection = reflect( - uSunDirection, normal);
    float specular =  - dot(reflection, viewDirection);
    specular = max(specular,0.0);
    specular = pow(specular, 32.0);
    specular*= specularCloudsColor.r;

    vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
    color += specular * specularColor;
    



    // Final color
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}