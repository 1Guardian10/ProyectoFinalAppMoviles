import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { supabase } from '../supabase/supabase';
import { showAlert } from '../utils/AlertNativa';

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [userId, setUserId] = useState<string | null>(null);

    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    const [rol, setRol] = useState<string | null>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);

            // Usuario autenticado
            const { data: authData } = await supabase.auth.getUser();
            const user = authData?.user;

            if (!user) {
                showAlert('Error', 'No hay usuario autenticado');
                return;
            }

            setUserId(user.id);
            setCorreo(user.email || '');

            // Datos de la tabla usuarios
            const { data: usuario, error } = await supabase
                .from('usuarios')
                .select(`
          id,
          nombre,
          correo,
          telefono,
          direccion_text,
          rol_id,
          roles(nombre)
        `)
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setNombre(usuario?.nombre || '');
            setCorreo(usuario?.correo || user.email || '');
            setTelefono(usuario?.telefono || '');
            setDireccion(usuario?.direccion_text || '');
            setRol(usuario?.roles?.nombre || null);
        } catch (e: any) {
            showAlert('Error', e.message || 'No se pudo cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!userId) return;

        if (!nombre.trim()) {
            return showAlert('Validación', 'El nombre no puede estar vacío');
        }

        try {
            setSaving(true);

            const { error } = await supabase
                .from('usuarios')
                .update({
                    nombre: nombre.trim(),
                    correo: correo.trim() || null,
                    telefono: telefono.trim() || null,
                    direccion_text: direccion.trim() || null,
                })
                .eq('id', userId);

            if (error) throw error;

            showAlert('Éxito', 'Perfil actualizado correctamente');
            loadProfile();
        } catch (e: any) {
            showAlert('Error', e.message || 'No se pudo guardar el perfil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-blue-700">
                <ActivityIndicator size="large" color="#fff" />
                <Text className="text-white mt-3">Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-blue-700">
            {/* HEADER */}
            <View className="h-44 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-b-[40px] px-5 pt-10 justify-center">
                <Text className="text-white text-3xl font-extrabold">
                    Mi perfil
                </Text>
                <Text className="text-blue-100 mt-1">
                    Información personal del usuario
                </Text>
            </View>

            {/* CONTENIDO */}
            <View className="px-5 -mt-6 pb-6">
                <View className="bg-white rounded-[22px] p-4 shadow-xl border border-blue-100">

                    {/* ROL */}
                    <View className="mb-4">
                        <Text className="text-gray-500 text-xs">Rol</Text>
                        <View className="bg-blue-100 px-3 py-2 rounded-full self-start">
                            <Text className="text-blue-700 font-bold capitalize text-sm">
                                {rol || 'Sin rol'}
                            </Text>
                        </View>
                    </View>

                    {/* NOMBRE */}
                    <Text className="text-blue-900 font-semibold text-sm mb-1">
                        Nombre
                    </Text>
                    <TextInput
                        value={nombre}
                        onChangeText={setNombre}
                        className="border border-blue-200 rounded-lg px-3 py-2 mb-3"
                    />

                    {/* CORREO */}
                    <Text className="text-blue-900 font-semibold text-sm mb-1">
                        Correo
                    </Text>
                    <TextInput
                        value={correo}
                        onChangeText={setCorreo}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="border border-blue-200 rounded-lg px-3 py-2 mb-3"
                    />

                    {/* TELÉFONO */}
                    <Text className="text-blue-900 font-semibold text-sm mb-1">
                        Teléfono
                    </Text>
                    <TextInput
                        value={telefono}
                        onChangeText={setTelefono}
                        keyboardType="phone-pad"
                        className="border border-blue-200 rounded-lg px-3 py-2 mb-3"
                    />

                    {/* DIRECCIÓN */}
                    <Text className="text-blue-900 font-semibold text-sm mb-1">
                        Dirección
                    </Text>
                    <TextInput
                        value={direccion}
                        onChangeText={setDireccion}
                        className="border border-blue-200 rounded-lg px-3 py-2 mb-4"
                    />

                    {/* BOTÓN GUARDAR */}
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className={`py-3 rounded-xl items-center ${saving ? 'bg-gray-400' : 'bg-blue-600'
                            }`}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold">
                                Guardar cambios
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}